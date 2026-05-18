/**
 * Utility per garantire che un valore sia sempre un array,
 * evitando errori di runtime su .map() o altri metodi di iterazione.
 */
export const safeArray = <T>(input: T | T[] | null | undefined): T[] => {
  return Array.isArray(input) ? input : [];
};

/**
 * Utility per garantire che un valore sia sempre un oggetto,
 * evitando errori di runtime su accessi di proprietà nidificate.
 */
export const safeObject = (input: any): Record<string, any> => {
  return (input && typeof input === 'object' && !Array.isArray(input)) ? input : {};
};
