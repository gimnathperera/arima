import { describe, expect, it } from 'vitest';
import {
  developmentCsp,
  fileRendererOrigin,
  getContentSecurityPolicy,
  getDevRendererOrigin,
  isAllowedRendererUrl,
  productionCsp,
  rendererDevServerOrigin,
  secureWebPreferences,
} from '@main/security';

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
    expect(productionCsp).toContain("font-src 'self' data:");
    expect(productionCsp).not.toContain('https:');
  });

  it('documents the single renderer development origin', () => {
    expect(rendererDevServerOrigin).toBe('http://localhost:5173');
  });

  it('allows only local renderer entry points for top-level navigation', () => {
    expect(isAllowedRendererUrl(`${rendererDevServerOrigin}/`, false)).toBe(true);
    expect(isAllowedRendererUrl(`${fileRendererOrigin}/app/out/renderer/index.html`, false)).toBe(true);
    expect(isAllowedRendererUrl('https://example.test/', false)).toBe(false);
    expect(isAllowedRendererUrl(`${fileRendererOrigin}/app/out/renderer/index.html`, true)).toBe(true);
    expect(isAllowedRendererUrl(`${rendererDevServerOrigin}/`, true)).toBe(false);
  });

  it('allows the actual electron-vite renderer URL when Vite changes ports', () => {
    expect(getDevRendererOrigin('http://localhost:5174/')).toBe('http://localhost:5174');
    expect(isAllowedRendererUrl('http://localhost:5174/', false, 'http://localhost:5174/')).toBe(
      true,
    );
    expect(isAllowedRendererUrl('http://localhost:5173/', false, 'http://localhost:5174/')).toBe(
      false,
    );
  });

  it('supplies appropriate CSP in development vs production', () => {
    expect(getContentSecurityPolicy(true)).toBe(productionCsp);
    expect(getContentSecurityPolicy(false, 'http://localhost:5173')).toBe(developmentCsp);
    expect(getContentSecurityPolicy(false, undefined)).toBe(productionCsp);
    expect(developmentCsp).toContain("'unsafe-inline'");
    expect(developmentCsp).toContain("'unsafe-eval'");
    expect(developmentCsp).toContain('ws:');
  });
});
