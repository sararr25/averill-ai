// Photo check (FB-08, owner decision D3). Everything here runs on this device: the page images sent by the browser card are
// written to a temporary file, read with the macOS OCR helper that imports already use, and deleted again. No image bytes and
// no OCR text leave this module; the result carries only short findings that cite an approved source line.
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const taskReview = require('./task-review');
const rules = require('./rules');

const MAX_IMAGES = 4;
const MAX_BODY_BYTES = 6 * 1024 * 1024; // the bridge accepts this much for an image check, and nothing more
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // one decoded PNG
const MAX_ALT = 300;
const OCR_TIMEOUT_MS = 30000;
const IMAGE_TASKS = ['instagram', 'linkedin'];
const PNG_URL = /^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const clip = (value, max) => String(value ?? '').slice(0, max);

// Checks the shape of what the card sent. Returns clean images with the PNG already decoded; throws a plain error otherwise.
function validate(images) {
  if (!Array.isArray(images) || images.length > MAX_IMAGES) throw new Error(`Send 0 to ${MAX_IMAGES} images.`);
  return images.map(image => {
    if (!image || typeof image !== 'object') throw new Error('Invalid image.');
    const { width, height } = image;
    if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 || width > 30000 || height > 30000) throw new Error('Invalid image size.');
    if (image.alt !== undefined && (typeof image.alt !== 'string' || image.alt.length > MAX_ALT)) throw new Error('Invalid alt text.');
    let bytes = null;
    if (image.dataUrl !== undefined) {
      const match = typeof image.dataUrl === 'string' ? image.dataUrl.match(PNG_URL) : null;
      if (!match) throw new Error('Images must be PNG data.');
      bytes = Buffer.from(match[1], 'base64');
      if (bytes.length > MAX_IMAGE_BYTES) throw new Error('An image is too large to check.');
      if (bytes.length < PNG_SIGNATURE.length || !bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) throw new Error('Images must be PNG data.');
    }
    return { width, height, alt: (image.alt || '').trim(), bytes, unreadable: image.unreadable === true || bytes === null };
  });
}

// The macOS OCR helper imports already use (scripts/extract-text.swift). Errors are raised, never turned into empty text.
function defaultOcr(file) {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'darwin') { reject(new Error('Reading text in images needs macOS.')); return; }
    const scripts = path.join(__dirname, '..', 'scripts');
    const binary = path.join(scripts, 'extract-text-macos-arm64');
    const command = fs.existsSync(binary) ? binary : '/usr/bin/swift';
    const args = command === binary ? [file] : [path.join(scripts, 'extract-text.swift'), file];
    const cache = path.join(os.tmpdir(), 'averill-swift-cache');
    execFile(command, args, { timeout: OCR_TIMEOUT_MS, maxBuffer: 1024 * 1024, encoding: 'utf8', env: { ...process.env, SWIFT_MODULECACHE_PATH: cache, CLANG_MODULE_CACHE_PATH: cache } },
      (error, stdout) => error ? reject(new Error(error.killed ? 'Reading the text took too long.' : 'The text reader failed.')) : resolve(String(stdout).trim()));
  });
}

// Writes one image to a private temp folder, reads its text, and removes the folder whatever happens.
async function readText(bytes, { ocr = defaultOcr, tempDir = os.tmpdir() } = {}) {
  const directory = fs.mkdtempSync(path.join(tempDir, 'averill-image-'));
  try {
    const file = path.join(directory, 'image.png');
    fs.writeFileSync(file, bytes, { mode: 0o600 });
    return clip(await ocr(file), 6000);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

// The approved image lines for this work type, each with the exact source line to cite.
function imageRules(sources, task) {
  const found = [];
  for (const { source, text } of sources) {
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      const rule = rules.parseImageLine(line);
      if (rule && (rule.task === task || rule.task === 'any')) found.push({ ...rule, source, quote: line });
    }
  }
  return found;
}
const citation = (entry) => ({ id: entry.source.id, title: clip(entry.source.title, 160), version: String(entry.source.version || ''), quote: entry.quote });
const ratioText = (width, height) => `${(width / height).toFixed(2)}:1`;

async function run({ workspace, task, images, ocr = defaultOcr, tempDir = os.tmpdir() }) {
  if (!IMAGE_TASKS.includes(task)) throw new Error('Image checks cover Instagram and LinkedIn posts.');
  const eligible = taskReview.currentSources(workspace, task).filter(entry => entry.source.confidentiality !== 'restricted' && !entry.source.containsCredentials);
  const sourceById = new Map(eligible.map(entry => [entry.source.id, entry]));
  const image = imageRules(eligible, task);
  const findings = [], notes = [], summary = [];
  const add = (type, index, suggestion, entry, observedExcerpt = '') => findings.push({ id: crypto.randomUUID(), type, imageIndex: index, observedExcerpt: clip(observedExcerpt, 200), suggestion: clip(suggestion, 400), source: citation(entry) });
  const ruleFor = type => image.filter(rule => rule.type === type);

  if (!images.length) {
    const required = ruleFor('required');
    if (required.length) add('image-missing', 0, 'No image was found in this post editor. Attach one. The approved guidance asks for an image on every post.', required[0]);
    else notes.push('No image was found in this post editor.');
  }
  for (const [offset, item] of images.entries()) {
    const index = offset + 1, label = `Image ${index}`;
    const ratio = item.width / item.height;
    if (!item.alt) {
      const rule = ruleFor('alt-text')[0];
      if (rule) { add('image-alt-missing', index, `${label} has no alt text. Describe what it shows for people who cannot see it.`, rule); }
    }
    const aspect = ruleFor('aspect');
    if (aspect.length) {
      const ranges = aspect.flatMap(rule => rule.ranges);
      if (!rules.aspectFits(ratio, ranges)) add('image-aspect', index, `${label} is ${item.width} by ${item.height} pixels (${ratioText(item.width, item.height)}). The approved ratios are ${aspect.map(rule => rule.value).join('; ')}. Crop it or choose another image.`, aspect[0]);
    }
    const wide = ruleFor('min-width');
    if (wide.length) {
      const needed = Math.max(...wide.map(rule => rule.pixels));
      if (item.width < needed) add('image-too-small', index, `${label} is ${item.width} pixels wide. The approved minimum is ${needed}. Use a larger file.`, wide.find(rule => rule.pixels === needed));
    }
    let reading;
    if (item.unreadable) { reading = 'text not read'; notes.push(`${label} could not be read on this page, so the text inside it was not checked.`); }
    else {
      try {
        const text = await readText(item.bytes, { ocr, tempDir });
        reading = text ? 'text read' : 'no text found';
        if (text) {
          // The same engine as captions, limited to claims: hashtags and caption-only requirements do not apply to an image.
          const found = taskReview.localReview(workspace, task, text, null).findings.filter(f => f.type === 'forbidden-claim');
          for (const f of found) {
            const entry = sourceById.get(f.source?.id);
            if (!entry || typeof f.source.quote !== 'string' || !f.source.quote || !entry.text.includes(f.source.quote) || !text.includes(f.observedExcerpt)) continue;
            add('forbidden-claim', index, `${label} shows “${f.observedExcerpt}”. The approved rules don’t allow it. Replace the image or its text.`, { source: entry.source, quote: f.source.quote }, f.observedExcerpt);
          }
        }
      } catch (error) {
        reading = 'text could not be read';
        notes.push(`${label}: the text inside could not be read on this device (${clip(error.message, 120)}).`);
      }
    }
    summary.push({ index, width: item.width, height: item.height, altPresent: Boolean(item.alt), reading });
  }
  // Say what was not checked, so a missing rule is never read as a clean result.
  const labels = { required: 'image present', 'alt-text': 'alt text', aspect: 'aspect ratio', 'min-width': 'minimum width' };
  const covered = Object.keys(labels).filter(type => ruleFor(type).length);
  if (images.length) for (const type of ['alt-text', 'aspect', 'min-width']) if (!ruleFor(type).length) notes.push(`No approved ${labels[type]} rule applies to this work type, so it was not checked.`);
  const state = findings.length ? 'findings' : sourceById.size ? 'no-conflict' : 'insufficient-evidence';
  return { id: crypto.randomUUID(), state, findings: findings.slice(0, 12), images: summary, notes: notes.slice(0, 8), scope: { task, sourceCount: sourceById.size, checked: covered.map(type => labels[type]).concat(images.some(item => !item.unreadable) ? ['text in the image'] : []) } };
}

module.exports = { MAX_IMAGES, MAX_BODY_BYTES, MAX_IMAGE_BYTES, IMAGE_TASKS, validate, readText, defaultOcr, imageRules, run };
