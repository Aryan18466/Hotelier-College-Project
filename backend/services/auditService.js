const AuditLog = require('../models/AuditLog');

const logAudit = async ({ actorId, action, entityType, entityId, details = {}, req = null }) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
      : '';

    await AuditLog.create({
      actorId: actorId || null,
      action,
      entityType,
      entityId: String(entityId || ''),
      details,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error(`[Audit Log Failed]: ${error.message}`);
  }
};

module.exports = {
  logAudit,
};
