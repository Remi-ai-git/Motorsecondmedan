// =========================================================================
// Middleware validasi input berbasis Zod. Dipakai di route:
//   router.post('/', validate(createMotorSchema), controller.create)
//
// Kalau body tidak valid, langsung throw AppError(400) dengan detail field
// mana yang salah — ditangkap errorHandler dan dikirim sebagai response
// JSON yang konsisten, tanpa perlu try/catch berulang di tiap controller.
// =========================================================================

const AppError = require('../utils/AppError');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new AppError('Data yang dikirim tidak valid', 400, details);
    }

    req.body = result.data;
    next();
  };
}

module.exports = validate;
