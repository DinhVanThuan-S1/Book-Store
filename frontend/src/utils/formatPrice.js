/**
 * ==============================================
 * FORMAT PRICE UTILITY
 * ==============================================
 * Format số tiền sang định dạng VND
 */

/**
 * Format giá tiền VND
 * @param {Number} price - Số tiền
 * @returns {String} - VD: "50.000₫"
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Format giá tiền VND (không symbol)
 * @param {Number} price
 * @returns {String} - VD: "50.000"
 */
export const formatPriceNoSymbol = (price) => {
  if (!price && price !== 0) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Parse giá tiền từ string về number
 * @param {String} priceStr - VD: "50.000"
 * @returns {Number}
 */
export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  
  // Remove all non-digit characters except decimal point
  const cleanStr = priceStr.replace(/[^\d]/g, '');
  return parseInt(cleanStr, 10) || 0;
};

export default formatPrice;