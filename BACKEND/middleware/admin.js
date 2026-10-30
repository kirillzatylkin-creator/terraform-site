export default function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
