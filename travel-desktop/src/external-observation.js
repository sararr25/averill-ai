const crypto = require('node:crypto');
const path = require('node:path');
const { promisify } = require('node:util');
const { execFile } = require('node:child_process');

const run = promisify(execFile);
const helper = path.join(__dirname, '..', 'scripts', 'window-context-macos-arm64');

function windowNumber(sourceId) {
  const match = /^window:(\d+):\d+$/.exec(String(sourceId || ''));
  return match ? match[1] : null;
}

async function nativeWindow(mode, sourceId) {
  const number = windowNumber(sourceId);
  if (process.platform !== 'darwin' || !number) return { status: 'unavailable' };
  try {
    const { stdout } = await run(helper, [mode, number], { timeout: 5000, maxBuffer: 32 * 1024 });
    const result = JSON.parse(stdout);
    return result && typeof result === 'object' ? result : { status: 'unavailable' };
  } catch { return { status: 'unavailable' }; }
}

function observation({ personId, windowId, windowName, method, text, timestamp = new Date() }) {
  let content = String(text || '').trim().slice(0, 6000);
  let sensitiveRedacted = false;
  content = content.replace(/\b(password|api[_ -]?key|access[_ -]?token|client[_ -]?secret|private[_ -]?key)\s*[:=]\s*([^\s,;]{4,})/gi, (_match, label) => { sensitiveRedacted = true; return `${label}: [redacted]`; });
  content = content.replace(/\b(?:\d[ -]?){13,19}\b/g, candidate => {
    const digits = candidate.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return candidate;
    let sum = 0; let double = false;
    for (let i = digits.length - 1; i >= 0; i--) { let value = Number(digits[i]); if (double) { value *= 2; if (value > 9) value -= 9; } sum += value; double = !double; }
    if (sum % 10 !== 0) return candidate;
    sensitiveRedacted = true; return '[payment number redacted]';
  });
  return {
    personId,
    windowId,
    windowName,
    method,
    confidence: method === 'browser-dom' ? 'selected-field' : method === 'accessibility' ? 'structured-text' : 'visible-text-only',
    capturedAt: timestamp.toISOString(),
    text: content,
    sensitiveRedacted,
    contentHash: crypto.createHash('sha256').update(content).digest('hex'),
  };
}

module.exports = { windowNumber, nativeWindow, observation };
