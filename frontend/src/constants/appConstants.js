/**
 * ==============================================
 * APP CONSTANTS
 * ==============================================
 * Các hằng số dùng trong app
 */

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

/**
 * Order Status Labels (Vietnamese)
 */
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PREPARING]: 'Đang chuẩn bị',
  [ORDER_STATUS.SHIPPING]: 'Đang giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.RETURNED]: 'Hoàn trả',
};

/**
 * Order Status Colors
 */
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'gold',
  [ORDER_STATUS.CONFIRMED]: 'blue',
  [ORDER_STATUS.PREPARING]: 'cyan',
  [ORDER_STATUS.SHIPPING]: 'purple',
  [ORDER_STATUS.DELIVERED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'red',
  [ORDER_STATUS.RETURNED]: 'orange',
};

/**
 * Payment Methods
 */
export const PAYMENT_METHODS = {
  COD: 'COD',
  BANK_TRANSFER: 'bank_transfer',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  CREDIT_CARD: 'credit_card',
};

/**
 * Payment Method Labels
 */
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
  [PAYMENT_METHODS.ZALOPAY]: 'Ví ZaloPay',
  [PAYMENT_METHODS.CREDIT_CARD]: 'Thẻ tín dụng/ghi nợ',
};

/**
 * Sort Options
 */
export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: 'salePrice', label: 'Giá thấp đến cao' },
  { value: '-salePrice', label: 'Giá cao đến thấp' },
  { value: '-averageRating', label: 'Đánh giá cao nhất' },
  { value: '-purchaseCount', label: 'Bán chạy nhất' },
  { value: 'title', label: 'Tên A-Z' },
  { value: '-title', label: 'Tên Z-A' },
];

/**
 * Price Ranges
 */
export const PRICE_RANGES = [
  { label: 'Dưới 50.000đ', min: 0, max: 50000 },
  { label: '50.000đ - 100.000đ', min: 50000, max: 100000 },
  { label: '100.000đ - 200.000đ', min: 100000, max: 200000 },
  { label: '200.000đ - 500.000đ', min: 200000, max: 500000 },
  { label: 'Trên 500.000đ', min: 500000, max: null },
];

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 36, 48],
};

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

/**
 * Book Formats
 */
export const BOOK_FORMATS = {
  HARDCOVER: 'hardcover',
  PAPERBACK: 'paperback',
  EBOOK: 'ebook',
};

/**
 * Book Format Labels
 */
export const BOOK_FORMAT_LABELS = {
  [BOOK_FORMATS.HARDCOVER]: 'Bìa cứng',
  [BOOK_FORMATS.PAPERBACK]: 'Bìa mềm',
  [BOOK_FORMATS.EBOOK]: 'Sách điện tử',
};

/**
 * Languages
 */
export const LANGUAGES = {
  VIETNAMESE: 'Vietnamese',
  ENGLISH: 'English',
  OTHER: 'Other',
};

/**
 * Language Labels
 */
export const LANGUAGE_LABELS = {
  [LANGUAGES.VIETNAMESE]: 'Tiếng Việt',
  [LANGUAGES.ENGLISH]: 'Tiếng Anh',
  [LANGUAGES.OTHER]: 'Khác',
};

/**
 * RegEx Patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(0|\+84)[0-9]{9,10}$/,
  PASSWORD: /^.{6,}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

export default {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  SORT_OPTIONS,
  PRICE_RANGES,
  PAGINATION,
  USER_ROLES,
  BOOK_FORMATS,
  BOOK_FORMAT_LABELS,
  LANGUAGES,
  LANGUAGE_LABELS,
  REGEX_PATTERNS,
};