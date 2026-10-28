const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');
const { spawnSync } = require('child_process');
const path = require('path');
const User = require('../models/User');
const { getJwtSecret, validateJwtConfig } = require('../config/jwt');

const originalJwtSecret = process.env.JWT_SECRET;
const originalJwtExpire = process.env.JWT_EXPIRE;
const validSecret = 'test-only-jwt-secret-that-is-long-enough-1234567890';

afterEach(() => {
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }

  if (originalJwtExpire === undefined) {
    delete process.env.JWT_EXPIRE;
  } else {
    process.env.JWT_EXPIRE = originalJwtExpire;
  }
});

describe('JWT configuration', () => {
  test.each([
    ['missing', undefined, /JWT_SECRET is required/],
    ['too short', 'short-secret', /at least 32 characters/],
    ['known fallback', 'hotelpro_super_secure_jwt_secret_key_2026_xyz', /placeholder value/],
    ['placeholder', 'replace-with-a-placeholder-secret-that-is-long', /placeholder value/],
  ])('rejects a %s JWT_SECRET', (_, secret, expectedError) => {
    if (secret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = secret;
    }

    expect(validateJwtConfig).toThrow(expectedError);
  });

  test('signs tokens that verify with the same configured secret', () => {
    process.env.JWT_SECRET = validSecret;
    process.env.JWT_EXPIRE = '7d';
    const user = new User({
      _id: new Types.ObjectId(),
      name: 'JWT Test User',
      email: 'jwt-test@example.com',
      passwordHash: 'not-saved-or-used',
      role: 'staff',
    });

    const token = user.getSignedJwtToken();
    const decoded = jwt.verify(token, getJwtSecret());

    expect(decoded.id).toBe(user._id.toString());
    expect(decoded.role).toBe('staff');
  });

  test('stops application startup when JWT_SECRET is missing', () => {
    const environment = { ...process.env, NODE_ENV: 'test' };
    delete environment.JWT_SECRET;
    const result = spawnSync(process.execPath, ['-e', "require('./index')"], {
      cwd: path.join(__dirname, '..'),
      env: environment,
      encoding: 'utf8',
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Invalid JWT configuration: JWT_SECRET is required/);
    expect(result.stderr).not.toContain('JWT_SECRET=');
  });
});
