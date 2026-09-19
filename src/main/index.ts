import { app, protocol, session } from 'electron';
import log from 'electron-log/main';
import { registerIpcHandlers } from './ipc';
import { createMainWindow } from './window';
import { denyAllPermissions, getContentSecurityPolicy } from './security';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'arima-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

app.setName('Arima');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

async function bootstrap(): Promise<void> {
  await app.whenReady();

  log.initialize();

  session.defaultSession.setPermissionRequestHandler(denyAllPermissions);
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = getContentSecurityPolicy(app.isPackaged, process.env.ELECTRON_RENDERER_URL);
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    });
  });

  registerIpcHandlers();
  createMainWindow();

  if (process.env.ARIMA_STARTUP_SMOKE === '1') {
    setTimeout(() => app.quit(), 500);
  }
}

void bootstrap();

app.on('activate', () => {
  if (app.isReady() && !process.env.ARIMA_STARTUP_SMOKE) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
