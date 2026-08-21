export const success = (res, { data = null, message = 'OK', status = 200, meta = undefined } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};
