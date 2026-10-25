import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// FB-03: demo copy must not contain em dashes or en dashes (they read as AI-written).
// Exception: the audience name below is defined by the approved Vamo source pack (Marketing/current-brief.md field
// requirement), which lives outside this tool. Rename it there first, then drop this exception.
const SOURCE_PACK_AUDIENCE = 'Travel subscribers — Denmark';
const root = new URL('..', import.meta.url).pathname;
const filesIn = (dir: string, ext: string) => readdirSync(join(root, dir)).filter(name => name.endsWith(ext)).map(name => join(dir, name));
const files = [
  ...filesIn('src/services', '.ts'), ...filesIn('src/data', '.json'), ...filesIn('public/vamo/posts', '.svg'),
  ...filesIn('src/components/brevo', '.tsx'), ...filesIn('src/components/shared', '.tsx'), ...filesIn('src/pages', '.tsx'),
];
test('demo copy files exist for the dash check', () => { assert.ok(files.length > 20, `only ${files.length} files found`); });
for (const file of files) {
  test(`no em or en dash in ${file}`, () => {
    const text = readFileSync(join(root, file), 'utf8').split(SOURCE_PACK_AUDIENCE).join('');
    const hit = text.match(/.{0,30}[—–].{0,30}/);
    assert.equal(hit, null, `dash found: ${hit?.[0]}`);
  });
}
