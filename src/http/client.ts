export interface HttpRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
}

export interface HttpResponse<T = unknown> {
    status: number;
    data: T;
    headers: Headers;
}

export class HttpClient {
    constructor(private defaultTimeoutMs: number = 30000) {}

    async request<T>(url: string, options: HttpRequestOptions): Promise<HttpResponse<T>> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? this.defaultTimeoutMs);

        try {
            const response = await fetch(url, {
                method: options.method,
                headers: options.headers,
                body: options.body,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const contentType = response.headers.get('content-type');
            let data: T;

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = (await response.text()) as T;
            }

            return { status: response.status, data, headers: response.headers };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
}
