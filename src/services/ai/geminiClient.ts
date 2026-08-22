export interface BackendHealth {
  server: boolean;
  geminiConfigured: boolean;
  model: string;
}

export class GeminiClient {
  private isBackendConfigured: boolean = false;
  private healthCheckPromise: Promise<BackendHealth> | null = null;

  constructor() {
    this.healthCheckPromise = this.checkHealth();
  }

  public async checkHealth(): Promise<BackendHealth> {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        this.isBackendConfigured = Boolean(data.geminiConfigured);
        return data;
      }
    } catch {
      // Backend not running or offline
    }
    this.isBackendConfigured = false;
    return { server: false, geminiConfigured: false, model: 'demo-fallback' };
  }

  public hasKey(): boolean {
    return this.isBackendConfigured;
  }

  public async isConfigured(): Promise<boolean> {
    if (this.healthCheckPromise) {
      const h = await this.healthCheckPromise;
      return h.geminiConfigured;
    }
    const h = await this.checkHealth();
    return h.geminiConfigured;
  }

  public async callBackend<T>(action: string, payload: any): Promise<T | null> {
    try {
      const response = await fetch('/api/civic-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action || '', payload: payload || {} }),
      });

      if (!response.ok) {
        let errorCode = 'HTTP_ERROR';
        try {
          const errJson = await response.json();
          errorCode = errJson.errorCode || errorCode;
        } catch {
          // ignore non-json response
        }
        console.warn(`[CivicFlow AI Diagnostic] Action: "${action}", Status: ${response.status}, ErrorCode: "${errorCode}"`);
        return null;
      }

      const res = await response.json();
      if (res.success && res.data) {
        return res.data as T;
      }

      if (res.success === false) {
        console.warn(`[CivicFlow AI Diagnostic] Action: "${action}", Status: ${response.status}, ErrorCode: "${res.errorCode || 'UNKNOWN'}"`);
      }

      return null;
    } catch (err) {
      console.warn(`[CivicFlow AI Diagnostic] Action: "${action}", Status: NetworkError, ErrorCode: "CLIENT_FETCH_ERROR"`);
      return null;
    }
  }

  public async generateJSON<T>(systemInstruction: string, userPrompt: string): Promise<T | null> {
    return this.callBackend<T>('understand', { userDescription: userPrompt, answers: {} });
  }
}

export const defaultGeminiClient = new GeminiClient();

