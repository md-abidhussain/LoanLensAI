const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const RISK_LEVELS = ['Low', 'Medium', 'High', 'Predatory'];

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  RISK_LEVELS
};
