/**
 * Utility functions for handling bilingual content
 */

export function createBilingualSearchClause(searchTerm, fields) {
  if (!searchTerm || !fields || fields.length === 0) {
    return {};
  }

  const searchLower = searchTerm.toLowerCase();
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchLower,
        mode: 'insensitive'
      }
    }))
  };
}

export function getBilingualField(data, field, language = 'en') {
  if (!data || !field) return '';
  
  const fieldData = data[field];
  if (typeof fieldData === 'string') {
    return fieldData;
  }
  
  if (typeof fieldData === 'object' && fieldData !== null) {
    return fieldData[language] || fieldData.en || fieldData.ar || '';
  }
  
  return '';
}

export function setBilingualField(data, field, value, language = 'en') {
  if (!data || !field) return data;
  
  if (typeof data[field] === 'object' && data[field] !== null) {
    data[field][language] = value;
  } else {
    data[field] = { [language]: value };
  }
  
  return data;
}
