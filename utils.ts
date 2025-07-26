
/**
 * Converts a File object to a base64 encoded string.
 * The string does not include the 'data:...' prefix.
 */
export const fileToBase64 = (file: File): Promise<string> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URI prefix (e.g., "data:image/png;base64,")
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });

/**
 * Creates a browser-readable URL from a File object.
 * This is used for previewing files like images and PDFs in iframes/img tags.
 */
export const createFileDataUrl = (file: File): Promise<string> => {
    // For text-based files like XML, we read as text to avoid base64 encoding issues in iframes
    if (file.type.includes('xml')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                const result = reader.result as string;
                const blob = new Blob([result], { type: 'text/xml' });
                resolve(URL.createObjectURL(blob));
            };
            reader.onerror = error => reject(error);
        });
    }

    // For other files (images, pdf), create a direct object URL
    return Promise.resolve(URL.createObjectURL(file));
}

/**
 * Converts a base64 string back into a Blob and creates a local URL for it.
 * This is crucial for reviving file previews from localStorage.
 * @param base64 The raw base64 data (without the data: prefix).
 * @param type The MIME type of the file.
 * @returns A string containing a URL representing the object given in the parameter.
 */
export const base64ToBlobUrl = (base64: string, type: string): string => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: type });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Failed to convert base64 to blob URL", e);
    return "";
  }
};
