import fs from 'fs';

export interface NormalizedAppStoreConfig {
  keyId: string;
  issuerId: string;
  privateKey: string;
  bundleId?: string;
  appStoreId?: string;
  vendorNumber?: string;
}

function normalizePrivateKey(rawKey: string): string {
  let privateKey = rawKey.trim();
  if (!privateKey) {
    return '';
  }

  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    try {
      const decoded = Buffer.from(privateKey, 'base64').toString('utf-8').trim();
      if (decoded.includes('BEGIN PRIVATE KEY')) {
        privateKey = decoded;
      } else {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
    } catch {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
  } else {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return privateKey;
}

function readPrivateKeyFromEnv(): string {
  const inlineKey =
    process.env.APPLE_PRIVATE_KEY ||
    process.env.APP_STORE_CONNECT_P8 ||
    '';

  if (inlineKey.trim()) {
    return normalizePrivateKey(inlineKey);
  }

  const keyPath = process.env.APP_STORE_CONNECT_P8_PATH;
  if (keyPath && fs.existsSync(keyPath)) {
    return normalizePrivateKey(fs.readFileSync(keyPath, 'utf-8'));
  }

  return '';
}

export function getNormalizedConfig(): NormalizedAppStoreConfig {
  return {
    keyId: (process.env.APPLE_KEY_ID || process.env.APP_STORE_CONNECT_KEY_ID || '').trim(),
    issuerId: (
      process.env.APPLE_ISSUER_ID ||
      process.env.APP_STORE_CONNECT_ISSUER_ID ||
      ''
    ).trim(),
    privateKey: readPrivateKeyFromEnv(),
    bundleId: (
      process.env.APPLE_BUNDLE_ID ||
      process.env.APP_STORE_CONNECT_BUNDLE_ID ||
      ''
    ).trim() || undefined,
    appStoreId: (
      process.env.APPLE_APP_STORE_ID ||
      process.env.APP_STORE_CONNECT_APP_STORE_ID ||
      ''
    ).trim() || undefined,
    vendorNumber: (
      process.env.APP_STORE_CONNECT_VENDOR_NUMBER ||
      process.env.APPLE_VENDOR_NUMBER ||
      ''
    ).trim() || undefined,
  };
}

export function validateRequiredConfig(config: NormalizedAppStoreConfig): string[] {
  const missing: string[] = [];

  if (!config.keyId) {
    missing.push('APPLE_KEY_ID or APP_STORE_CONNECT_KEY_ID');
  }
  if (!config.issuerId) {
    missing.push('APPLE_ISSUER_ID or APP_STORE_CONNECT_ISSUER_ID');
  }
  if (!config.privateKey) {
    missing.push('APPLE_PRIVATE_KEY, APP_STORE_CONNECT_P8, or APP_STORE_CONNECT_P8_PATH');
  }

  return missing;
}

export function detectTransportType(): 'stdio' | 'http' {
  const envTransport = process.env.MCP_TRANSPORT?.toLowerCase();
  if (envTransport === 'http' || envTransport === 'http-sse') {
    return 'http';
  }

  if (process.argv.includes('--http')) {
    return 'http';
  }

  return 'stdio';
}
