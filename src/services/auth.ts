import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import { AppStoreConnectConfig } from '../types/index.js';

export class AuthService {
  constructor(private config: AppStoreConnectConfig) {}

  async generateToken(): Promise<string> {
    const privateKey = await fs.readFile(this.config.privateKeyPath, 'utf-8');
    
    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '20m', // App Store Connect tokens can be valid for up to 20 minutes
      audience: 'appstoreconnect-v1',
      keyid: this.config.keyId,
      issuer: this.config.issuerId,
    });

    return token;
  }

  validateConfig(): void {
    const hasInlineKey = Boolean(process.env.APPLE_PRIVATE_KEY || process.env.APP_STORE_CONNECT_P8);
    const hasKeyPath = Boolean(this.config.privateKeyPath);

    if (!this.config.keyId || !this.config.issuerId || (!hasInlineKey && !hasKeyPath)) {
      throw new Error(
        'Missing required environment variables. Please set: ' +
        'APPLE_KEY_ID/APP_STORE_CONNECT_KEY_ID, APPLE_ISSUER_ID/APP_STORE_CONNECT_ISSUER_ID, ' +
        'and APPLE_PRIVATE_KEY/APP_STORE_CONNECT_P8/APP_STORE_CONNECT_P8_PATH'
      );
    }
  }
}