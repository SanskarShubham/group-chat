// Function to get file type from MIME type
const getFileTypeFromMimeType = (mimeType) => {
    // Define a map of common MIME types to file extensions
    const mimeToExtensionMap = {
        'image/jpeg': 'image',
        'image/png': 'image',
        'image/gif': 'image',
        'image/bmp': 'image',
        'image/webp': 'image'
        // Add more mappings as needed
    };

    // Check if the provided MIME type exists in the map
    if (mimeToExtensionMap.hasOwnProperty(mimeType)) {
        return mimeToExtensionMap[mimeType];
    } else {
        return "otherFile";
    }
};
module.exports = getFileTypeFromMimeType;
