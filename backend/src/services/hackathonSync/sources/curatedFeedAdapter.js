import BaseSourceAdapter from '../baseAdapter.js';

/**
 * CuratedFeedAdapter
 * Fetches real, machine-readable hackathons from verified public community directories:
 * - Primary: Hack Club Open Hackathons Directory (https://hackathons.hackclub.com/api/events/upcoming)
 * - Secondary: Open Hackalist Community Archive (GitHub Raw)
 */
export class CuratedFeedAdapter extends BaseSourceAdapter {
  constructor() {
    super(
      'curated',
      'Curated Community Feed',
      'Verified, machine-readable open hackathon listings from Hack Club Directory and open community feeds'
    );
    this.primaryUrl =
      process.env.HACKATHON_CURATED_FEED_URL ||
      'https://hackathons.hackclub.com/api/events/upcoming';
    this.timeoutMs = 12000;
  }

  isEnabled() {
    // Enabled by default unless explicitly disabled via environment
    return process.env.HACKATHON_SOURCE_CURATED_ENABLED !== 'false';
  }

  async fetchHackathons() {
    if (!this.isEnabled()) {
      this.setStatus('DISABLED');
      return [];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      console.log(`[Sync:Curated] Fetching live hackathons from ${this.primaryUrl}...`);
      const response = await fetch(this.primaryUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'HackMatch-Sync-Agent/1.0 (https://hackmatch.dev)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText} from ${this.primaryUrl}`);
      }

      const events = await response.json();
      if (!Array.isArray(events)) {
        throw new Error(`Invalid JSON format: expected an array, got ${typeof events}`);
      }

      console.log(`[Sync:Curated] Successfully retrieved ${events.length} real events.`);
      this.setStatus('LIVE', null, events.length);

      // Map raw events to standardized properties for normalizer
      return events.map((item) => ({
        id: item.id || item._id,
        title: item.name || item.title,
        description: item.description || (item.name ? `${item.name} - Community Hackathon` : ''),
        organizer: item.organizer || (item.hack_club_event ? 'Hack Club Community' : (item.city ? `${item.city} Hackathon Team` : 'Community Organizer')),
        mode: item.hybrid ? 'Hybrid' : (item.virtual ? 'Online' : 'Offline'),
        location: [item.city, item.state, item.country].filter(Boolean).join(', ') || (item.virtual ? 'Global Online' : ''),
        startDate: item.start || item.startDate,
        endDate: item.end || item.endDate,
        registrationDeadline: item.start || item.startDate, // Default deadline is event start
        registrationLink: item.website || item.url,
        externalUrl: item.website || item.url || `https://hackathons.hackclub.com`,
        sourceUpdatedAt: item.createdAt || new Date(),
        tags: [
          'Hackathon',
          item.virtual ? 'Virtual' : 'In-Person',
          item.countryCode || item.country,
        ].filter(Boolean),
        banner: item.banner,
        logo: item.logo,
      }));
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`[Sync:Curated] Failed to fetch live data: ${err.message}`);
      this.setStatus('ERROR', err, 0);
      throw err;
    }
  }
}

export default CuratedFeedAdapter;
