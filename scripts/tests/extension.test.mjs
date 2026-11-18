import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runInNewContext } from 'node:vm';
const folder = new URL('../../extension/', import.meta.url);
test('MV3 companion has local scripts, scoped hosts and no broad network permissions', () => {
 const m = JSON.parse(fs.readFileSync(new URL('manifest.json', folder)));
 assert.equal(m.manifest_version, 3);
 assert.deepEqual(m.permissions, ['activeTab', 'sidePanel', 'storage']);
 assert.ok(!m.host_permissions);
 for (const file of [m.background.service_worker, m.side_panel.default_path, ...m.content_scripts[0].js, ...m.content_scripts[0].css]) assert.ok(fs.existsSync(new URL(file, folder)));
 assert.ok(m.content_scripts[0].matches.every(host => host.startsWith('https://') && !host.includes('<all_urls>')));
});
test('autofill rejects unverified answers and security fields', () => {
 const scope = {}; runInNewContext(fs.readFileSync(new URL('policy.js', folder), 'utf8'), scope);
 const input = answer => JSON.stringify({version:1,answers:[answer]});
 assert.throws(() => scope.JobHunterPolicy.parsePayload(input({label:'Name',value:'Owner',verified:false})));
 assert.throws(() => scope.JobHunterPolicy.parsePayload(input({label:'Password',value:'not-a-secret',verified:true})));
 assert.throws(() => scope.JobHunterPolicy.parsePayload(JSON.stringify({version:1,answers:[],unknown_questions:-1})));
 assert.equal(scope.JobHunterPolicy.parsePayload(input({label:'Name',value:'Owner',verified:true})).answers.length,1);
});
