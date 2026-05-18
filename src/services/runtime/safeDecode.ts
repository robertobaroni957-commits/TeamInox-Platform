export const safeArray = (arr: any): any[] => Array.isArray(arr) ? arr : [];
export const safeString = (str: any, def: string = ""): string => typeof str === 'string' ? str : def;
export const safeNumber = (num: any, def: number = 0): number => typeof num === 'number' ? num : def;
export const safeObject = (obj: any): object => (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};

export const safeLifecycle = (data: any) => ({
    name: safeString(data?.name, "Unknown"),
    lastUpdated: data?.lastUpdated ? safeString(data.lastUpdated) : null,
    isImporting: !!data?.isImporting,
    isReady: !!data?.isReady
});
