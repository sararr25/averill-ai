// Task suggestions never grant permissions. Source visibility is enforced by workspace retrieval.
const playbooks = {
  content_creator: [
    ['Improve this draft', 'Rewrite the shared draft using the current approved campaign facts. Keep complete sentences and a clear CTA.'],
    ['Help me in Canva', 'How do I align two text elements in Canva?'],
    ['Draft a marketing email', 'Write a truthful marketing email for the current approved campaign, with a main body of at least 200 characters and one clear CTA.'],
  ],
  marketing_strategy: [
    ['Adapt the campaign', 'Draft an organic LinkedIn post for the approved campaign and audience. Use only supported offer facts and a clear CTA.'],
    ['Plan the message', 'Prepare a checklist for adapting the approved campaign message to email, organic LinkedIn and paid Instagram. Separate the channel requirements.'],
  ],
  marketing_manager: [
    ['Review the handover', 'Prepare a checklist of current approved campaign requirements, source versions and decisions that need my review.'],
    ['Explain the requirements', 'Which current campaign rules should my team check before using this draft?'],
  ],
  operations: [
    ['Prepare a handover', 'Turn the current approved Operations handover into an actionable checklist. Cite each requirement and identify missing details.'],
    ['Explain the next step', 'What is the next supported step in this Operations handover?'],
  ],
};
function forPerson(person) {
  if (!person || person.department && !['Marketing', 'Operations'].includes(person.department)) return [];
  const key = person.department === 'Operations' ? 'operations' : (person.profile === 'owner' ? 'marketing_manager' : person.profile) || person.accountProfile || (person.role === 'lead' || person.role === 'admin' ? 'marketing_manager' : 'content_creator');
  return (playbooks[key] || playbooks.content_creator).map(([title, prompt]) => ({ title, prompt }));
}
module.exports = { forPerson };
