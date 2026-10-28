const MINIMUM_JWT_SECRET_LENGTH = 32;

const knownInsecureSecrets = new Set([
  'fallback_secret',
  'hotelpro_super_secure_jwt_secret_key_2026_xyz',
  'placeholder_secret_key',
]);

const configurationError = (reason) =>
  new Error(`Invalid JWT configuration: ${reason}. Set a unique JWT_SECRET of at least ${MINIMUM_JWT_SECRET_LENGTH} characters.`);

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    throw configurationError('JWT_SECRET is required');
  }

  const normalizedSecret = secret.trim();
  if (normalizedSecret.length < MINIMUM_JWT_SECRET_LENGTH) {
    throw configurationError(`JWT_SECRET must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters`);
  }

  if (
    knownInsecureSecrets.has(normalizedSecret.toLowerCase()) ||
    /(?:placeholder|change[-_ ]?me|your[-_ ]?jwt[-_ ]?secret)/i.test(normalizedSecret)
  ) {
    throw configurationError('JWT_SECRET must not use a placeholder value');
  }

  return normalizedSecret;
};

const validateJwtConfig = () => {
  getJwtSecret();
};

module.exports = {
  getJwtSecret,
  validateJwtConfig,
  MINIMUM_JWT_SECRET_LENGTH,
};
