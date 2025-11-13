// ==========================================
// AIRTABLE CONFIGURATION
// ==========================================

const AIRTABLE_CONFIG = {
  // ⚠️ REPLACE WITH YOUR ACTUAL VALUES:
  BASE_ID: 'pat8rqI3MuD9U1rZN.50132f136f68b48666f9f51158c37e55818d6c91f4da7708c11f1562db5611f6',  // Example: 'app'
  API_KEY: 'appvrYTLBc9U97WgZ',  // Example: 'pat'

  TABLES: {
    HUTS: 'Huts',
    // Future: add FROADS, CAMPSITES etc.
  },

  // Cache settings
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// ==========================================
// AIRTABLE API WRAPPER
// ==========================================

class AirtableService {
  constructor(config) {
    this.config = config;
    this.baseUrl = `https://api.airtable.com/v0/${config.BASE_ID}`;
  }

  /**
   * Fetch records from a table with optional filtering
   * @param {string} tableName - Name of the table
   * @param {object} options - Query options (filter, sort, etc.)
   * @returns {Promise<Array>} - Array of records
   */
  async fetchRecords(tableName, options = {}) {
    const url = new URL(`${this.baseUrl}/${encodeURIComponent(tableName)}`);

    // Add query parameters
    if (options.filterByFormula) {
      url.searchParams.append('filterByFormula', options.filterByFormula);
    }
    if (options.sort) {
      options.sort.forEach((s, i) => {
        url.searchParams.append(`sort[${i}][field]`, s.field);
        url.searchParams.append(`sort[${i}][direction]`, s.direction || 'asc');
      });
    }
    if (options.maxRecords) {
      url.searchParams.append('maxRecords', options.maxRecords);
    }

    try {
      // 🐛 Debug logging
      console.log('🔍 API Request:', {
        url: url.toString(),
        baseId: this.config.BASE_ID,
        apiKeyPrefix: this.config.API_KEY.substring(0, 10) + '...',
        apiKeyLength: this.config.API_KEY.length
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.config.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Enhanced error with response details
        const errorText = await response.text();
        console.error('❌ Airtable API Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error(`❌ Error fetching ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch records with automatic caching
   * @param {string} tableName - Name of the table
   * @param {string} cacheKey - LocalStorage key for caching
   * @param {object} options - Query options
   * @returns {Promise<Array>} - Array of records
   */
  async fetchWithCache(tableName, cacheKey, options = {}) {
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`✅ Using cached data for ${tableName}`);
      return cached;
    }

    // Fetch fresh data
    console.log(`📡 Fetching fresh data from Airtable: ${tableName}`);
    const records = await this.fetchRecords(tableName, options);

    // Save to cache
    this.saveToCache(cacheKey, records);

    return records;
  }

  /**
   * Get data from LocalStorage cache
   */
  getFromCache(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < this.config.CACHE_DURATION) {
        return data;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(key);
        return null;
      }
    } catch (error) {
      console.warn('⚠️ Error reading cache:', error);
      return null;
    }
  }

  /**
   * Save data to LocalStorage cache
   */
  saveToCache(key, data) {
    try {
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
      console.log(`💾 Cached data for: ${key}`);
    } catch (error) {
      console.warn('⚠️ Error saving to cache:', error);
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('airtable_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Airtable cache cleared');
  }

  /**
   * Force refresh - bypass cache
   */
  async forceRefresh(tableName, cacheKey, options = {}) {
    localStorage.removeItem(cacheKey);
    return this.fetchWithCache(tableName, cacheKey, options);
  }
}

// ==========================================
// INITIALIZE SERVICE
// ==========================================

const airtableService = new AirtableService(AIRTABLE_CONFIG);

// ==========================================
// HUTS-SPECIFIC FUNCTIONS
// ==========================================

/**
 * Load huts from Airtable
 * @returns {Promise<Array>} - Array of huts in app format
 */
async function loadHutsFromAirtable() {
  try {
    const records = await airtableService.fetchWithCache(
      AIRTABLE_CONFIG.TABLES.HUTS,
      'airtable_huts_cache',
      {
        // Only fetch active huts
        filterByFormula: "OR({Status} = 'Active', {Status} = '')",
        sort: [{ field: 'Name', direction: 'asc' }]
      }
    );

    // Transform Airtable format to app format
    return records.map(record => {
      const fields = record.fields;
      return {
        name: fields.Name || 'Unnamed Hut',
        lat: parseFloat(fields.Latitude),
        lng: parseFloat(fields.Longitude),
        link: fields.Link || '',
        photo: fields.Photo || 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad9?q=80&w=1200&auto=format&fit=crop',
        desc: fields.Description || ''
      };
    }).filter(hut => !isNaN(hut.lat) && !isNaN(hut.lng)); // Filter out invalid coordinates
  } catch (error) {
    console.error('❌ Failed to load huts from Airtable:', error);

    // Fallback to empty array or show error to user
    return [];
  }
}

/**
 * Manually refresh huts data
 */
async function refreshHutsData() {
  try {
    const records = await airtableService.forceRefresh(
      AIRTABLE_CONFIG.TABLES.HUTS,
      'airtable_huts_cache',
      {
        filterByFormula: "OR({Status} = 'Active', {Status} = '')",
        sort: [{ field: 'Name', direction: 'asc' }]
      }
    );

    console.log(`✅ Refreshed ${records.length} huts from Airtable`);

    // Reload map markers
    if (typeof reloadHutsLayer === 'function') {
      reloadHutsLayer();
    }

    return records;
  } catch (error) {
    console.error('❌ Failed to refresh huts:', error);
    throw error;
  }
}

// ==========================================
// DEBUG & TESTING FUNCTIONS
// ==========================================

/**
 * Test Airtable connection with detailed diagnostics
 */
async function testAirtableConnection() {
  console.log('🧪 Testing Airtable connection...\n');

  // Check config
  console.log('1️⃣ Configuration check:');
  console.log('   Base ID:', AIRTABLE_CONFIG.BASE_ID);
  console.log('   API Key starts with:', AIRTABLE_CONFIG.API_KEY.substring(0, 10));
  console.log('   API Key length:', AIRTABLE_CONFIG.API_KEY.length);
  console.log('   Expected format: pat[12-14 chars].[rest]');

  // Validate token format
  if (!AIRTABLE_CONFIG.API_KEY.startsWith('pat')) {
    console.error('❌ API Key should start with "pat" (Personal Access Token)');
    console.error('   If you have an old API key starting with "key", you need to create a new Personal Access Token');
    console.error('   Go to: https://airtable.com/create/tokens');
    return;
  }

  if (!AIRTABLE_CONFIG.API_KEY.includes('.')) {
    console.error('❌ API Key should contain a dot (.) - it might be incomplete');
    return;
  }

  console.log('   ✅ Token format looks valid\n');

  // Test API call
  console.log('2️⃣ Testing API call...');
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLES.HUTS}?maxRecords=1`;
    console.log('   URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`
      }
    });

    console.log('   Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS! Records found:', data.records?.length || 0);
      if (data.records?.length > 0) {
        console.log('   Sample record:', data.records[0].fields);
      }
    } else {
      const errorText = await response.text();
      console.error('   ❌ FAILED!');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Response:', errorText);

      if (response.status === 401) {
        console.error('\n   💡 401 Unauthorized means:');
        console.error('      - Token is invalid or expired');
        console.error('      - Token might be incomplete (copied only part of it)');
        console.error('      - Check you copied the ENTIRE token including part after the dot');
      } else if (response.status === 403) {
        console.error('\n   💡 403 Forbidden means:');
        console.error('      - Token does not have access to this base');
        console.error('      - Go to https://airtable.com/create/tokens');
        console.error('      - Edit your token → Add access to base:', AIRTABLE_CONFIG.BASE_ID);
      } else if (response.status === 404) {
        console.error('\n   💡 404 Not Found means:');
        console.error('      - Base ID is wrong, or');
        console.error('      - Table name "Huts" does not exist (case-sensitive!)');
      }
    }
  } catch (error) {
    console.error('   ❌ Network error:', error.message);
  }
}

// Expose functions globally for testing
window.airtableService = airtableService;
window.loadHutsFromAirtable = loadHutsFromAirtable;
window.refreshHutsData = refreshHutsData;
window.testAirtableConnection = testAirtableConnection;
