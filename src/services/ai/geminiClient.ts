export interface BackendHealth {
  server: boolean;
  geminiConfigured: boolean;
  model: string;
}

export class GeminiClient {
  private isBackendConfigured: boolean = false;

  constructor() {
    this.checkHealth();
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

  public async callBackend<T>(action: string, payload: any): Promise<T | null> {
    try {
      const response = await fetch('/api/civic-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) return null;
      const res = await response.json();
      if (res.success && res.data) {
        return res.data as T;
      }
      return null;
    } catch (err) {
      console.warn(`Error calling backend action ${action}:`, err);
      return null;
    }
  }
}

export const defaultGeminiClient = new GeminiClient();
