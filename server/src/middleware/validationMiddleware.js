export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req[source]);
      req[source] = validated;
      next();
    } catch (err) {
      if (err.errors) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: errors[0]?.message || 'Validation error',
          errors,
        });
      }
      next(err);
    }
  };
}
