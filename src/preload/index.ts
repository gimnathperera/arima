import { contextBridge, ipcRenderer } from 'electron';
import { appInfoSchema } from '@shared/app-info';
import type { ArimaApi } from '@shared/arima-api';
import { ipcChannels } from '@shared/ipc';
import { appErrorSchema, type Result } from '@shared/result';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function parseResult<T>(schema: { parse: (value: unknown) => T }, value: unknown): Result<T> {
  if (isRecord(value) && value.ok === true && 'data' in value) {
    return { ok: true, data: schema.parse(value.data) };
  }

  if (isRecord(value) && value.ok === false && 'error' in value) {
    return { ok: false, error: appErrorSchema.parse(value.error) };
  }

  return {
    ok: false,
    error: {
      code: 'IPC_INVALID_RESPONSE',
      message: 'The application returned an invalid response.',
      retryable: false,
    },
  };
}

export const arimaApi: ArimaApi = {
  app: {
    async getInfo() {
      const response = await ipcRenderer.invoke(ipcChannels.appGetInfo);
      return parseResult(appInfoSchema, response);
    },
  },
};

contextBridge.exposeInMainWorld('arima', arimaApi);
