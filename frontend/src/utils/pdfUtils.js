import html2canvas from 'html2canvas';

/**
 * Converts an image file or URL to a base64 string
 * @param {string} url - The URL or path to the image
 * @returns {Promise<string>} - Base64 representation of the image
 */
export const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = url;
  });
};

/**
 * Captures a DOM element as a base64 image using html2canvas
 * @param {HTMLElement} element - The element to capture
 * @returns {Promise<string>} - Base64 PNG image
 */
export const captureComponentAsBase64 = async (element) => {
  if (!element) return null;
  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality in PDF
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });
  return canvas.toDataURL('image/png');
};
/**
 * Converts an image file or URL to a circular base64 string
 * @param {string} url - The URL or path to the image
 * @returns {Promise<string>} - Base64 representation of the circular image
 */
export const getCircularBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // create a square canvas based on the smallest dimension
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // create a circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw the image centered
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = url;
  });
};
