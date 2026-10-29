// Capability, runtime availability and acceptance evidence are different facts.
const definitions = {
  canva: { help: true, read: 'open readable slide', write: 'named single-paragraph uniform-format text only', verify: 'text, size, alignment, margin and contrast', manual: ['grouping', 'export', 'publication'] },
  email: { help: true, read: 'selected field only', write: 'plain input or textarea only', verify: 'matching observed rules; no hidden audience/footer settings', manual: ['rich email layout', 'send', 'schedule'] },
  linkedin: { help: true, read: 'selected field only', write: 'plain input or textarea only', verify: 'organic company-post rules for observed matching fields', manual: ['rich composer edits', 'publish', 'schedule'] },
  instagram: { help: true, read: 'selected field only', write: 'plain input or textarea only', verify: 'paid disclosure and channel rules for observed matching fields', manual: ['rich composer edits', 'partnership setting', 'publish', 'schedule'] },
};
function forTask(task) { return definitions[task] ? { ...definitions[task], manual: [...definitions[task].manual], publication: false, realPlatformAcceptance: 'see current acceptance ledger' } : { help: false, read: 'explicitly shared text', write: 'manual', publication: false }; }
module.exports = { forTask };
