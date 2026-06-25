/**
 * Compresses an image file and converts it to a base64 Data URL string.
 * This effectively acts as a compressed binary file representation stored in base64.
 * 
 * @param {File} file The image file to compress.
 * @param {number} maxWidth The maximum allowed width of the compressed image.
 * @param {number} maxHeight The maximum allowed height of the compressed image.
 * @param {number} quality The JPEG compression quality (0.0 to 1.0).
 * @returns {Promise<string>} A promise that resolves to the compressed image's base64 Data URL.
 */
export function compressAndConvert(file, maxWidth = 800, maxHeight = 800, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas drawing to a compressed JPEG base64 DataURL
        const base64Str = canvas.toDataURL('image/jpeg', quality);
        resolve(base64Str);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
