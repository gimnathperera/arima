import { describe, expect, it } from 'vitest';
import { productionCsp, rendererDevServerOrigin, secureWebPreferences } from '@main/security';

describe('main security defaults', () => {
  it('keeps the renderer sandboxed and isolated from Node', () => {
    expect(secureWebPreferences).toMatchObject({
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    });
  });

  it('uses a restrictive content security policy', () => {
    expect(productionCsp).toContain("default-src 'self'");
    expect(productionCsp).toContain("object-src 'none'");
    expect(productionCsp).toContain("frame-ancestors 'none'");
    expect(productionCsp).not.toContain('https:');
  });

  it('documents the single renderer development origin', () => {
    expect(rendererDevServerOrigin).toBe('http://localhost:5173');
  });
});
