import BaseSourceAdapter from '../baseAdapter.js';

/**
 * DevpostAdapter
 * Adapter for Devpost hackathons.
 * NOTE: Devpost does not offer a public open API for hackathon listings.
 * Automated scraping is restricted by Devpost Terms of Service.
 * This adapter is DISABLED by default until an authorized partner API is provided.
 */
export class DevpostAdapter extends BaseSourceAdapter {
  constructor() {
    super(
      'devpost',
      'Devpost',
      'Official partner integration for Devpost developer hackathons'
    );
    this.apiKey = process.env.DEVPOST_API_KEY || '';
    this.apiUrl = process.env.DEVPOST_API_URL || '';
  }

  isEnabled() {
    return process.env.HACKATHON_SOURCE_DEVPOST_ENABLED === 'true';
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
        'Devpost adapter is disabled: No public events API exists without an authorized enterprise/partner key.'
      );
      this.setStatus('UNAVAILABLE', err);
      console.warn(`[Sync:Devpost] ${err.message}`);
      return [];
    }

    try {
      console.log(`[Sync:Devpost] Querying Devpost partner endpoint...`);
      const response = await fetch(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Devpost API returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const events = Array.isArray(data) ? data : (data.hackathons || data.items || []);
      this.setStatus('LIVE', null, events.length);
      return events;
    } catch (err) {
      this.setStatus('ERROR', err, 0);
      throw err;
    }
  }
}

export default DevpostAdapter;
