/**
 * Store URL Generator
 * Generates SEO-friendly store URLs using city/state abbreviations
 * 
 * Format: {state-code}-{city-code}-{store-number}
 * Example: dl-ndl-001 (Delhi - New Delhi - Store 001)
 * 
 * Display Name: "FreshVilla New Delhi" (Full city name)
 */

const Store = require('../models/Store');

/**
 * Generate store URL from city code, state code, and store number
 * @param {string} stateCode - State abbreviation (e.g., 'DL', 'MH', 'KA')
 * @param {string} cityCode - City/District abbreviation (e.g., 'NDL', 'MUM', 'BLR')
 * @param {string} storeNumber - Store number (e.g., '001', '002')
 * @returns {string} - Store URL (e.g., 'dl-ndl-001')
 */
const generateStoreUrl = (stateCode, cityCode, storeNumber) => {
  if (!stateCode || !cityCode || !storeNumber) {
    throw new Error('State code, city code, and store number are required');
  }

  const url = `${stateCode.toLowerCase()}-${cityCode.toLowerCase()}-${storeNumber}`;
  return url;
};

/**
 * Generate next available store number for a city
 * @param {string} cityCode - City/District code
 * @returns {Promise<string>} - Next store number (e.g., '001', '002')
 */
const generateStoreNumber = async (cityCode) => {
  // Find highest store number for this city
  const stores = await Store.findAll({
    where: {
      cityCode: cityCode.toUpperCase()
    },
    attributes: ['storeNumber'],
    order: [['storeNumber', 'DESC']],
    limit: 1
  });

  if (stores.length === 0) {
    return '001'; // First store in this city
  }

  // Extract number and increment
  const lastNumber = parseInt(stores[0].storeNumber) || 0;
  const nextNumber = lastNumber + 1;
  
  // Pad with zeros (001, 002, etc.)
  return String(nextNumber).padStart(3, '0');
};

/**
 * Generate complete store data with URL
 * @param {object} storeData - Store data including city, state, cityCode, stateCode
 * @returns {Promise<object>} - Store data with generated storeNumber and storeUrl
 */
const generateStoreData = async (storeData) => {
  const { city, state, cityCode, stateCode } = storeData;

  if (!cityCode || !stateCode) {
    throw new Error('City code and state code are required');
  }

  // Generate store number
  const storeNumber = await generateStoreNumber(cityCode);

  // Generate store URL
  const storeUrl = generateStoreUrl(stateCode, cityCode, storeNumber);

  // Generate display name if not provided
  const displayName = storeData.name || `FreshVilla ${city}`;

  return {
    ...storeData,
    storeNumber,
    storeUrl,
    name: displayName
  };
};

/**
 * Parse store URL to extract components
 * @param {string} storeUrl - Store URL (e.g., 'dl-ndl-001')
 * @returns {object} - Parsed components { stateCode, cityCode, storeNumber }
 */
const parseStoreUrl = (storeUrl) => {
  const parts = storeUrl.split('-');
  
  if (parts.length !== 3) {
    throw new Error('Invalid store URL format. Expected format: state-city-number');
  }

  return {
    stateCode: parts[0].toUpperCase(),
    cityCode: parts[1].toUpperCase(),
    storeNumber: parts[2]
  };
};

/**
 * Validate store URL format
 * @param {string} storeUrl - Store URL to validate
 * @returns {boolean} - True if valid
 */
const isValidStoreUrl = (storeUrl) => {
  // Format: xx-xxx-nnn (2-3 letters, dash, 2-5 letters, dash, 3 digits)
  const urlPattern = /^[a-z]{2}-[a-z]{2,5}-\d{3}$/;
  return urlPattern.test(storeUrl);
};

/**
 * Get store display info from URL
 * @param {string} storeUrl - Store URL
 * @returns {Promise<object>} - Store display information
 */
const getStoreDisplayInfo = async (storeUrl) => {
  const store = await Store.findOne({
    where: { storeUrl },
    attributes: ['id', 'name', 'city', 'state', 'cityCode', 'stateCode', 'storeNumber', 'storeUrl']
  });

  if (!store) {
    throw new Error('Store not found');
  }

  return {
    id: store.id,
    displayName: store.name, // Full name: "FreshVilla New Delhi"
    shortName: `${store.city} ${store.storeNumber}`, // "New Delhi 001"
    url: store.storeUrl, // "dl-ndl-001"
    location: `${store.city}, ${store.state}`, // "New Delhi, Delhi"
    codes: {
      city: store.cityCode, // "NDL"
      state: store.stateCode // "DL"
    }
  };
};

module.exports = {
  generateStoreUrl,
  generateStoreNumber,
  generateStoreData,
  parseStoreUrl,
  isValidStoreUrl,
  getStoreDisplayInfo
};
