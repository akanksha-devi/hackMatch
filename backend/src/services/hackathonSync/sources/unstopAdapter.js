import BaseSourceAdapter from '../baseAdapter.js';

/**
 * UnstopAdapter
 * Adapter for Unstop competitions & hackathons.
 * NOTE: Unstop does not provide a public open API. Scraping without permission
 * violates Terms of Service. This adapter is DISABLED by default and requires
 * official partner credentials or authorized API key.
 */
export class UnstopAdapter extends BaseSourceAdapter {
  constructor() {
    super(
      'unstop',
      'Unstop',
      'Official enterprise/partner integration for Unstop hackathons & competitions'
    );
    this.apiKey = process.env.UNSTOP_API_KEY || '';
    this.apiUrl = process.env.UNSTOP_API_URL || '';
  }

  isEnabled() {
    return process.env.HACKATHON_SOURCE_UNSTOP_ENABLED === 'true';
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
        'Unstop adapter requires an official partner API key (UNSTOP_API_KEY). Automated scraping is restricted.'
      );
      this.setStatus('UNAVAILABLE', err);
      console.warn(`[Sync:Unstop] ${err.message}`);
      return [];
    }

    try {
      console.log(`[Sync:Unstop] Querying official Unstop partner API...`);
      const response = await fetch(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Unstop API returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const events = Array.isArray(data) ? data : (data.events || data.data || []);
      this.setStatus('LIVE', null, events.length);
      return events;
    } catch (err) {
      this.setStatus('ERROR', err, 0);
      throw err;
    }
  }
}

export default UnstopAdapter;
