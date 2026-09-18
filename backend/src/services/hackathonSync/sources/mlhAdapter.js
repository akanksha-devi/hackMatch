import BaseSourceAdapter from '../baseAdapter.js';

/**
 * MLHAdapter
 * Adapter for Major League Hacking (MLH) member hackathons.
 * NOTE: MLH only provides user OAuth (MyMLH), not an official open public listing API.
 * This adapter is DISABLED by default until an authorized partner feed is configured.
 */
export class MLHAdapter extends BaseSourceAdapter {
  constructor() {
    super(
      'mlh',
      'Major League Hacking (MLH)',
      'Official partner integration for MLH season member hackathons'
    );
    this.apiKey = process.env.MLH_API_KEY || '';
    this.apiUrl = process.env.MLH_API_URL || '';
  }

  isEnabled() {
    return process.env.HACKATHON_SOURCE_MLH_ENABLED === 'true';
  }

  getStatus() {
    if (!this.isEnabled()) {
      return 'DISABLED';
    }
    if (!this.apiKey && !this.apiUrl) {
      return 'UNAVAILABLE';
    }
    return this.status;
  }

  async fetchHackathons() {
    if (!this.isEnabled()) {
      this.setStatus('DISABLED');
      return [];
    }

    if (!this.apiKey && !this.apiUrl) {
      const err = new Error(
        'MLH adapter is disabled: Public event list API is unavailable. Official partner endpoint required.'
      );
      this.setStatus('UNAVAILABLE', err);
      console.warn(`[Sync:MLH] ${err.message}`);
      return [];
    }

    try {
      console.log(`[Sync:MLH] Querying MLH partner endpoint...`);
      const response = await fetch(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`MLH API returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const events = Array.isArray(data) ? data : (data.events || []);
      this.setStatus('LIVE', null, events.length);
      return events;
    } catch (err) {
      this.setStatus('ERROR', err, 0);
      throw err;
    }
  }
}

export default MLHAdapter;
