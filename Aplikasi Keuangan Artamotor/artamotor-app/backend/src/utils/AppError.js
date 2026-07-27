// =========================================================================
// AppError — error terkontrol yang bisa dilempar dari service/controller
// dengan status HTTP & pesan yang jelas untuk client. Error lain (bug,
// exception tak terduga) akan ditangkap sebagai 500 oleh errorHandler.
// =========================================================================

class AppError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
