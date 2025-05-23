/**
 * Ensures the attribute values are properly structured
 */
export const normalizeAttributeValues = (attribute: any) => {
  // Check if attribute exists
  if (!attribute) return null;
  
  // Create a copy to avoid mutating the original
  const normalizedAttribute = { ...attribute };
  
  // Handle missing values array
  if (!normalizedAttribute.values) {
    normalizedAttribute.values = [];
  }
  
  // Handle nested arrays (malformed data)
  if (Array.isArray(normalizedAttribute.values) && 
      normalizedAttribute.values.length > 0 && 
      Array.isArray(normalizedAttribute.values[0])) {
    normalizedAttribute.values = [];
  }
  
  return normalizedAttribute;
};

/**
 * Processes a list of attributes to ensure their values are properly structured
 */
export const normalizeAttributesList = (attributes: any[]) => {
  if (!Array.isArray(attributes)) return [];
  
  return attributes.map(normalizeAttributeValues)
    .filter(attribute => attribute !== null);
};
