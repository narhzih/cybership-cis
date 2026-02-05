export interface AppConfig {
    httpTimeoutMs: number;
}

function getEnvOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

export function loadAppConfig(): AppConfig {
    return {
        httpTimeoutMs: parseInt(getEnvOrDefault('HTTP_TIMEOUT_MS', '30000'), 10),
    };
}
