const { ZodError } = require('zod');

function validate(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const err = new Error('Payload inválido');
        err.status = 400;
        err.code = 'VALIDATION_ERROR';
        err.details = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return next(err);
      }

      return next(error);
    }
  };
}

module.exports = { validate };
