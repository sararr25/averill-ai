const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const bundle = path.join(root, 'dist', 'Averill-darwin-arm64', 'Averill.app');
const archive = path.join(root, 'dist', 'Averill-macOS-arm64.zip');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function inventory(directory, prefix = '') {
  return fs.readdirSync(directory).sort().flatMap(name => {
    const relative = path.join(prefix, name), file = path.join(directory, name), stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) return [[relative, `link:${fs.readlinkSync(file)}`]];
    if (stat.isDirectory()) return inventory(file, relative);
    return [[relative, digest(file)]];
  });
}
function verify() {
  const resource = path.join(bundle, 'Contents', 'Resources', 'app');
  // Electron Packager prunes the development lockfile and rewrites package.json.
  const tracked = execFileSync('git', ['ls-files', '-z', '.'], { cwd: root }).toString().split('\0').filter(relative => relative && !['package.json', 'package-lock.json'].includes(relative));
  const originalPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  const packaged = JSON.parse(fs.readFileSync(path.join(resource, 'package.json')));
  for (const field of ['name', 'version', 'main', 'dependencies']) {
    if (JSON.stringify(originalPackage[field]) !== JSON.stringify(packaged[field])) throw new Error(`Runtime package metadata differs: ${field}`);
  }
  for (const relative of tracked) {
    const source = path.join(root, relative), target = path.join(resource, relative);
    if (!fs.existsSync(target) || digest(source) !== digest(target)) throw new Error(`Package is stale or missing: ${relative}`);
  }
  for (const relative of ['scripts/extract-text-macos-arm64', 'scripts/window-context-macos-arm64']) {
    if (!fs.existsSync(path.join(resource, relative)) || digest(path.join(root, relative)) !== digest(path.join(resource, relative))) throw new Error(`Helper is stale or missing: ${relative}`);
  }
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-release-'));
  try {
    execFileSync('ditto', ['-x', '-k', archive, temporary]);
    const before = inventory(bundle), after = inventory(path.join(temporary, 'Averill.app'));
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Archive differs from the app bundle.');
    const evidence = { verifiedAt: new Date().toISOString(), sourceRevisionAtBuild: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(), archive: path.basename(archive), archiveSha256: digest(archive), bundleFiles: before.length, trackedSourceFiles: tracked.length, signed: false, target: 'macOS-arm64' };
    fs.writeFileSync(path.join(root, 'dist', 'release-verification.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(`PASS ${tracked.length} tracked source files, both native helpers and ${before.length} archived bundle entries; ZIP SHA-256 ${evidence.archiveSha256}`);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}
if (process.argv.includes('--verify')) verify();
else {
  if (process.platform !== 'darwin') throw new Error('The macOS release requires macOS and ditto.');
  execFileSync('npm', ['run', 'package:mac'], { cwd: root, stdio: 'inherit' });
  const next = archive + '.next.zip';
  try {
    execFileSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', bundle, next]);
    fs.renameSync(next, archive);
    verify();
  } finally { fs.rmSync(next, { force: true }); }
}
