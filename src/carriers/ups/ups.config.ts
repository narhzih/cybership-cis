export interface UPSConfig {
  clientId: string
  clientSecret: string
  accountNumber: string
  useSandbox: boolean
}

const UPS_URLS = {
  sandbox: {
    baseUrl: 'https://wwwcie.ups.com/api',
    authUrl: 'https://wwwcie.ups.com/security/v1/oauth/token',
  },
  production: {
    baseUrl: 'https://onlinetools.ups.com/api',
    authUrl: 'https://onlinetools.ups.com/security/v1/oauth/token',
  },
} as const

export function getUPSUrls(useSandbox: boolean) {
  return useSandbox ? UPS_URLS.sandbox : UPS_URLS.production
}

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export function loadUPSConfig(): UPSConfig {
  return {
    clientId: requireEnv('UPS_CLIENT_ID'),
    clientSecret: requireEnv('UPS_CLIENT_SECRET'),
    accountNumber: requireEnv('UPS_ACCOUNT_NUMBER'),
    useSandbox: process.env['UPS_ENVIRONMENT'] !== 'production',
  }
}
