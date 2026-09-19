import type { BrowserWindow, Session, WebContents } from 'electron';
import { app, shell } from 'electron';

export const rendererDevServerOrigin = 'http://localhost:5173';
export const fileRendererOrigin = 'file://';

export const productionCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: arima-media:",
  "font-src 'self' data:",
  "media-src 'self' arima-media:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

export const developmentCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: arima-media:",
  "font-src 'self' data:",
  "media-src 'self' arima-media:",
  "connect-src 'self' ws: http:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

export function getContentSecurityPolicy(
  isPackaged: boolean,
  rendererUrl = process.env.ELECTRON_RENDERER_URL,
): string {
  if (isPackaged || !rendererUrl) {
    return productionCsp;
  }

  return developmentCsp;
}

export const secureWebPreferences = {
  sandbox: true,
  contextIsolation: true,
  nodeIntegration: false,
  webSecurity: true,
  allowRunningInsecureContent: false,
} as const;

export function isTrustedRendererSender(sender: WebContents): boolean {
  return isAllowedRendererUrl(sender.getURL(), app.isPackaged, process.env.ELECTRON_RENDERER_URL);
}

export function getDevRendererOrigin(rendererUrl: string | undefined): string {
  if (!rendererUrl) {
    return rendererDevServerOrigin;
  }

  return new URL(rendererUrl).origin;
}

export function isAllowedRendererUrl(
  url: string,
  isPackaged: boolean,
  rendererUrl = process.env.ELECTRON_RENDERER_URL,
): boolean {
  if (isPackaged) {
    return url.startsWith(fileRendererOrigin);
  }

  return url.startsWith(getDevRendererOrigin(rendererUrl)) || url.startsWith(fileRendererOrigin);
}

export const denyAllPermissions: Parameters<Session['setPermissionRequestHandler']>[0] = (
  _webContents,
  _permission,
  callback,
) => {
  callback(false);
};

export function hardenWindow(window: BrowserWindow): void {
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedRendererUrl(url, app.isPackaged, process.env.ELECTRON_RENDERER_URL)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });
}
