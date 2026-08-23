module.exports = (req, _res, next) => {
  req.cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
      const separator = part.indexOf('=');
      const key = part.slice(0, separator).trim();
      const value = separator >= 0 ? part.slice(separator + 1) : '';
      try { return [key, decodeURIComponent(value)]; } catch { return [key, value]; }
    }),
  );
  next();
};
