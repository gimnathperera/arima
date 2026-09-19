import type { BrowserWindow, Session, WebContents } from 'electron';
import { app, shell } from 'electron';

export const rendererDevServerOrigin = 'http://localhost:5173';

export const productionCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: arima-media:",
  "font-src 'self'",
  "media-src 'self' arima-media:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

export const secureWebPreferences = {
  sandbox: true,
  contextIsolation: true,
  nodeIntegration: false,
  webSecurity: true,
  allowRunningInsecureContent: false,
} as const;

export function isTrustedRendererSender(sender: WebContents): boolean {
  const url = sender.getURL();

  if (app.isPackaged) {
    return url.startsWith('file://');
  }

  return url.startsWith(rendererDevServerOrigin);
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
    const currentUrl = window.webContents.getURL();
    if (url !== currentUrl) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });
}
