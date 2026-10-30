// Service readiness is independent of permission to send company content.
const privacy = require('./company-privacy');

function companyMode(data, key) { return Boolean(key && privacy.allowed(data)); }

class AIConnection {
  constructor({ models, pickModel, changed = () => {} }) {
    this.models = models; this.pickModel = pickModel; this.changed = changed;
    this.generation = 0; this.state = { status: 'starting', via: null };
  }
  snapshot() { return { ...this.state }; }
  async connect({ key, demo = false }) {
    const generation = ++this.generation;
    this.state = { status: key ? 'connecting' : demo ? 'available' : 'not-configured', via: key ? 'local-key' : demo ? 'demo-server' : null };
    this.changed();
    if (!key) return this.snapshot();
    try {
      // Model discovery sends only the saved credential to its own provider: no question, files or profile.
      const model = this.pickModel(await this.models(key));
      if (!model) throw new Error('No Nemotron model');
      if (generation === this.generation) this.state = { status: 'connected', via: 'local-key', model };
    } catch {
      if (generation === this.generation) this.state = { status: 'unavailable', via: 'local-key', retryable: true };
    }
    if (generation === this.generation) this.changed();
    return this.snapshot();
  }
}

module.exports = { AIConnection, companyMode };
