// Utility function to compare two arrays or objects
export function isEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }