const $ = id => document.getElementById(id);
let tabId = null;
function reset() { $('submit').disabled = true; $('submit').dataset.ready = 'no'; $('attest').checked = false; }
async function send(type, extra = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('Open a supported job site.');
  if (type === 'submit' && tab.id !== tabId) { reset(); throw new Error('Active tab changed; fill and review again.'); }
  const result = await chrome.tabs.sendMessage(tab.id, { type, ...extra });
  if (result?.error) throw new Error(result.error);
  return { result, id: tab.id };
}
function task(action) { return async () => { try { $('status').textContent = ''; await action(); } catch (error) { reset(); $('status').textContent = error.message || 'Unsupported page. Reload the supported site after installation.'; } }; }
$('extract').onclick = task(async () => { reset(); const { result } = await send('extract'); $('extracted').value = result.markdown; $('status').textContent = 'Extracted visible content. Review and redact before copying.'; });
$('copy').onclick = task(async () => { await navigator.clipboard.writeText($('extracted').value); $('status').textContent = 'Copied on your request.'; });
$('payload').oninput = reset;
$('file').onchange = task(async () => { reset(); const file = $('file').files[0]; if (!file) return; if (file.size > 200000) throw new Error('Use a JSON file under 200 KB.'); if (!file.name.endsWith('.json')) throw new Error('YAML requires explicit conversion to verified JSON; no automatic guessing.'); $('payload').value = await file.text(); });
for (const type of ['fill', 'profile']) $(type).onclick = task(async () => {
  reset(); const payload = JobHunterPolicy.parsePayload($('payload').value);
  const { result, id } = await send(type, { text: $('payload').value }); tabId = id;
  $('review').textContent = `${result.filled} fields staged. ${payload.company || 'Company not supplied'} / ${payload.role || 'Role not supplied'} / score ${payload.match_score ?? 'not supplied'} / PDF ${payload.resume_path || 'not supplied'}\n${payload.answers.map(a => `${a.label}: ${a.value}`).join('\n')}`;
  $('status').textContent = result.note;
  const decision = JobHunterPolicy.decision({ mode: payload.approval_mode, dryRun: payload.dry_run !== false, score: payload.match_score, minimum: payload.min_match_score ?? 7, unknown: payload.unknown_questions ?? 0, approved: true });
  $('submit').dataset.ready = type === 'fill' && decision === 'eligible' ? 'yes' : 'no';
});
$('attest').onchange = () => { $('submit').disabled = !$('attest').checked || $('submit').dataset.ready !== 'yes'; };
$('submit').onclick = task(async () => { const attested = $('attest').checked; reset(); const { result } = await send('submit', { attested }); $('status').textContent = result.note; });
$('forget').onclick = task(async () => { reset(); $('payload').value = ''; $('extracted').value = ''; $('review').textContent = 'No prepared form.'; await chrome.storage.local.clear(); $('status').textContent = 'Panel cleared. Data is not stored between sessions by this companion.'; });
