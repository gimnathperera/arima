import { app, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { appInfoSchema, type AppInfo } from '@shared/app-info';
import { ipcChannels } from '@shared/ipc';
import { err, ok, type Result } from '@shared/result';
import { isTrustedRendererSender } from './security';

function rejectedSender(): Result<never> {
  return err({
    code: 'IPC_FORBIDDEN_SENDER',
    message: 'This application window is not allowed to use that operation.',
    retryable: false,
  });
}

export function getAppInfo(): Result<AppInfo> {
  return ok(
    appInfoSchema.parse({
      name: 'Arima',
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
    }),
  );
}

export function requireTrustedSender(event: Pick<IpcMainInvokeEvent, 'sender'>): Result<true> {
  if (!isTrustedRendererSender(event.sender)) {
    return rejectedSender();
  }

  return ok(true);
}

export function registerIpcHandlers(): void {
  ipcMain.handle(ipcChannels.appGetInfo, (event) => {
    const allowed = requireTrustedSender(event);
    if (!allowed.ok) {
      return allowed;
    }

    return getAppInfo();
  });
}
