// Weekly practice question bank (T7.0, owner decision 28 October 2026). Every question shows a picture drawn for Averill
// (assets/learn/*.svg, local, no network, nothing generated at runtime) and is one of four answer types:
//   picture       choose one picture              value: option id
//   text-picture  choose one text answer          value: option id
//   tap           tap the spot in the picture     value: area id (areas are % of the picture)
//   order         put the steps in order          value: array of item ids
// plus "task": something to do in the tool, ticked by the design reading or confirmed once for the whole page.
// Rule-based questions cite the approved company rule (source title, version, quoted line); without one they fall back to the
// lesson guidance and say so.
const crypto = require('node:crypto');
const designCheck = require('./design-check');
const taskReview = require('./task-review');

const FILE = /^[a-z0-9-]+\.svg$/;
const pic = (file, alt) => { if (!FILE.test(file)) throw new Error('Unknown picture'); return { file, alt, source: `drawn for Averill, assets/learn/${file}` }; };
const opt = (id, label, picture) => ({ id, label, ...(picture ? { picture } : {}) });
const TYPE_ORDER = ['picture', 'tap', 'order', 'text-picture', 'task'];
const TYPE_LABEL = { picture: 'Choose a picture', 'text-picture': 'Choose an answer', tap: 'Tap the spot', order: 'Put in order', task: 'Do it in the tool' };

// The approved design rule of this type for Instagram posts, with the exact line to cite. Same source filtering as the Canva check.
function designRule(data, type) {
  let entries;
  try { entries = taskReview.currentSources(data, designCheck.FORMAT).filter(entry => entry.source.confidentiality !== 'restricted' && !entry.source.containsCredentials); } catch { return null; }
  const found = designCheck.designRules(entries).find(rule => rule.type === type);
  return found ? { sourceId: found.source.id, title: found.source.title, version: String(found.source.version || ''), quote: found.quote, number: found.number } : null;
}
const ruleStillApproved = (data, ref) => { const now = designRule(data, ref.type); return Boolean(now && now.sourceId === ref.sourceId && now.version === ref.version && now.quote === ref.quote); };

// Each entry is a function of the current company rules, so a changed or revoked rule changes the question.
function entries(data) {
  const margin = designRule(data, 'safe-margin'), contrast = designRule(data, 'contrast-normal');
  const marginPx = margin && [60, 108].includes(margin.number) ? margin.number : null;
  const cite = (rule, type) => rule ? { rule: { title: rule.title, version: rule.version, quote: rule.quote }, ruleRef: { type, sourceId: rule.sourceId, version: rule.version, quote: rule.quote } } : {};
  return [
    {
      bankId: 'email-footer-visible', type: 'text-picture', steps: ['email-footer'],
      prompt: 'Which footer keeps the reader in control?',
      picture: pic('task-brevo.svg', 'An email with the footer highlighted. Check whether the unsubscribe control is visible.'),
      options: [opt('hidden', 'Hide the unsubscribe link in tiny text'), opt('visible', 'Keep a visible unsubscribe link and check the approved sender details'), opt('remove', 'Remove the footer to shorten the email')],
      correct: 'visible',
      explanation: 'Keep the unsubscribe control visible. Use approved company guidance for the exact footer and sender details. This question checks the email task you confirmed; it does not verify a real email was sent.',
    },
    {
      bankId: 'headline-leads', type: 'picture', steps: ['hierarchy', 'size'], general: true,
      prompt: 'Which Instagram post has a headline that clearly leads?',
      picture: pic('post-headline-b.svg', 'Three Instagram posts to compare, shown below as the answer options.'),
      options: [opt('a', 'Post A', pic('post-headline-a.svg', 'Post A: the headline and the supporting line are the same size.')), opt('b', 'Post B', pic('post-headline-b.svg', 'Post B: a large two-line headline above a small supporting line.')), opt('c', 'Post C', pic('post-headline-c.svg', 'Post C: a small headline with a larger supporting line.'))],
      correct: 'b',
      explanation: 'Two clear levels tell the reader what to read first. In this lesson the headline is at least one and a half times the size of the supporting line. This is lesson guidance, not a company rule.',
    },
    {
      bankId: 'contrast-readable', type: 'picture', steps: ['contrast'],
      prompt: contrast ? `Which post meets the approved contrast of ${contrast.number} to 1 for normal text?` : 'Which post has text that is easiest to read?',
      picture: pic('post-contrast-b.svg', 'Three Instagram posts to compare, shown below as the answer options.'),
      options: [opt('a', 'Post A', pic('post-contrast-a.svg', 'Post A: very pale text on a cream background.')), opt('b', 'Post B', pic('post-contrast-b.svg', 'Post B: dark text on a cream background.')), opt('c', 'Post C', pic('post-contrast-c.svg', 'Post C: white text on a light yellow background.'))],
      correct: 'b',
      explanation: contrast ? 'Dark text on a light background is the only one with enough contrast; pale or white text on a light colour is hard to read.' : 'Dark text on a light background has plenty of contrast. The lesson guide asks for 4.5 to 1 for normal text. No approved company contrast rule is available to cite.',
      ...cite(contrast, 'contrast-normal'),
    },
    {
      bankId: 'margin-tap', type: 'tap', steps: ['margin'], general: true,
      prompt: `Tap the text that breaks the ${marginPx || 60} px safe margin.`,
      picture: pic(`design-margin-${marginPx || 60}.svg`, `An Instagram post design 1080 pixels wide. A dashed line marks the safe area ${marginPx || 60} pixels from every edge. Three areas can be tapped.`),
      areas: [
        { id: 'headline', label: 'Headline "Winter weekends", well inside the safe area', x: 13.9, y: 22.2, w: 64.8, h: 10.4 },
        { id: 'support', label: 'Supporting line, well inside the safe area', x: 13.9, y: 38.5, w: 55.6, h: 4.4 },
        { id: 'button', label: 'Book now button, very close to the left edge', x: 2.8, y: 87.4, w: 27.8, h: 4.4 },
      ],
      correct: 'button',
      explanation: `Only the Book now button sits closer than ${marginPx || 60} px to the left edge. Apps place buttons and crops near the edges, so text there can be hidden.${marginPx ? '' : ' This is lesson guidance: no approved company margin of 60 or 108 px is available to cite.'}`,
      ...cite(marginPx ? margin : null, 'safe-margin'),
    },
    {
      bankId: 'align-order', type: 'order', steps: ['align'], general: true,
      prompt: 'Order the steps to align two texts in Canva.',
      picture: pic('canva-align.svg', 'Two lines of text selected together in a design tool with the Position panel open.'),
      items: [opt('headline', 'Click the headline'), opt('shift', 'Hold Shift and click the supporting line'), opt('position', 'Open Position'), opt('align', 'Choose Left or Center alignment')],
      correct: ['headline', 'shift', 'position', 'align'],
      explanation: 'Select both texts first. With more than one element selected, Position aligns them to each other instead of to the page.',
    },
    {
      bankId: 'edge-crop', type: 'text-picture', steps: ['margin'],
      prompt: 'Why might the last line of this post be hidden in the app?',
      picture: pic('design-edge-crop.svg', 'A post where the app bar at the bottom covers a line of text that sits close to the bottom edge.'),
      options: [opt('edge', 'It sits at the edge, where the app places its own buttons'), opt('size', 'The font is too large'), opt('canva', 'Canva removed the text')],
      correct: 'edge',
      explanation: 'Platforms place buttons and crops near the edges; a margin keeps the message visible.',
    },
    {
      bankId: 'group-shortcut', type: 'text-picture', steps: ['group'],
      prompt: 'The headline and supporting line are selected together. Which action groups them in Canva?',
      picture: pic('canva-group.svg', 'A headline and a supporting line selected together in a design tool.'),
      options: [opt('print', 'Print the design'), opt('group', 'Choose Group in the editor toolbar'), opt('save', 'Download the design')],
      correct: 'group',
      explanation: 'Group in the editor toolbar keeps the selected elements together.',
    },
  ];
}

// Question content stored in a quiz: ids are fresh per quiz, the answer key stays server side until the page is submitted.
function instantiate(entry) {
  const q = { id: crypto.randomUUID(), ...entry };
  delete q.steps; delete q.general;
  if (q.type === 'order') {
    let shuffled;
    do { shuffled = [...q.items].sort(() => crypto.randomInt(3) - 1); } while (shuffled.every((item, index) => item.id === q.correct[index]));
    q.items = shuffled;
  }
  return q;
}

function taskQuestion(step) {
  return { id: crypto.randomUUID(), bankId: `task-${step.id}`, type: 'task', stepId: step.id, tool: 'Canva', prompt: step.title, picture: pic('task-canva.svg', 'A design open in a design tool with a tick showing that Averill has read the design.'), task: { instruction: step.instruction, help: step.help, check: 'auto', step: step.id }, explanation: 'Averill ticks this when it reads your open Canva design. If it could not see it, you confirm it once for the whole page.' };
}
function brevoTask() {
  return { id: crypto.randomUUID(), bankId: 'task-brevo-footer', type: 'task', tool: 'Brevo', prompt: 'Check the footer of your email draft', picture: pic('task-brevo.svg', 'An email draft with the footer line highlighted.'), task: { instruction: 'In your Brevo email draft, check that the footer has an unsubscribe link and the company address.', help: 'Open the draft in Brevo and scroll to the bottom of the email.', check: 'confirm', step: null }, explanation: 'Averill does not read the Brevo footer for this exercise, so you confirm it yourself on the page.' };
}
function sourceQuestion(linked, source) {
  return { id: crypto.randomUUID(), bankId: 'source-check', type: 'text-picture', stepId: null, sessionId: linked.id, source: linked.source, prompt: `Before using ${source.title} in your campaign, what should you check?`, picture: pic('rule-document.svg', 'A company guidance document with one approved rule line highlighted.'), options: [opt('current', 'Its current approval and version, then the instructions in the source'), opt('name', 'Only the file name'), opt('colleague', 'Whether a colleague used it once')], correct: 'current', explanation: `Open the current approved source and read its actual instructions. Version ${source.version} was linked to your session; this exercise does not infer its content.`, rule: { title: source.title, version: String(source.version || ''), quote: 'Approved source linked to your session' } };
}
// An approved rule practice item (rule-exercises.js) turned into a picture question. Its options keep their order.
function ruleItemQuestion(item, sourceTitle) {
  return { id: crypto.randomUUID(), bankId: 'rule-item', type: 'text-picture', stepId: null, ruleItemId: item.id, prompt: item.prompt, picture: pic('rule-document.svg', 'A company guidance document with one approved rule line highlighted.'), options: item.options.map((label, index) => opt(`o${index}`, label)), correct: `o${item.correct}`, explanation: `The approved answer is “${item.options[item.correct]}”.`, rule: { title: sourceTitle, version: String(item.sourceVersion || ''), quote: item.quote } };
}

module.exports = { TYPE_ORDER, TYPE_LABEL, entries, instantiate, taskQuestion, brevoTask, sourceQuestion, ruleItemQuestion, ruleStillApproved, designRule };
