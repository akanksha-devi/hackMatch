/**
 * BaseSourceAdapter
 * Abstract contract for hackathon discovery source adapters.
 */
export class BaseSourceAdapter {
  constructor(id, name, description = '') {
    if (new.target === BaseSourceAdapter) {
      throw new TypeError('Cannot construct BaseSourceAdapter instances directly');
    }
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = 'DISABLED'; // 'LIVE' | 'DISABLED' | 'UNAVAILABLE' | 'ERROR'
    this.lastSync = null;
    this.lastRecordCount = 0;
    this.lastError = null;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  /**
   * Whether this adapter is enabled in configuration
   * @returns {boolean}
   */
  isEnabled() {
    return false;
  }

  /**
   * Return health status string
   * @returns {'LIVE' | 'DISABLED' | 'UNAVAILABLE' | 'ERROR'}
   */
  getStatus() {
    if (!this.isEnabled()) {
      return 'DISABLED';
    }
    return this.status;
  }

  setStatus(status, error = null, recordCount = 0) {
    this.status = status;
    this.lastError = error ? (error.message || String(error)) : null;
    this.lastRecordCount = recordCount;
    this.lastSync = new Date();
  }

  /**
   * Fetch raw hackathons from external provider
   * @returns {Promise<Array<Object>>}
   */
  async fetchHackathons() {
    throw new Error(`fetchHackathons() must be implemented by adapter ${this.name}`);
  }

  getDetails() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isEnabled: this.isEnabled(),
      status: this.getStatus(),
      lastSync: this.lastSync,
      recordsCount: this.lastRecordCount,
      error: this.lastError,
    };
  }
}

export default BaseSourceAdapter;
