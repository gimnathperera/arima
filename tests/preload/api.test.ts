import { describe, expect, it, vi } from 'vitest';

const exposed: Record<string, unknown> = {};

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: (key: string, value: unknown) => {
      exposed[key] = value;
    },
  },
  ipcRenderer: {
    invoke: vi.fn().mockResolvedValue({
      ok: true,
      data: {
        name: 'Arima',
        version: '0.1.0',
        platform: 'darwin',
        arch: 'arm64',
      },
    }),
  },
}));

describe('preload API', () => {
  it('exposes only the narrow Arima API', async () => {
    const { ipcRenderer } = await import('electron');
    await import('@preload/index');

    expect(Object.keys(exposed)).toEqual(['arima']);
    expect(exposed.arima).toEqual({
      app: {
        getInfo: expect.any(Function),
      },
    });

    const api = exposed.arima as {
      app: {
        getInfo: () => Promise<unknown>;
      };
    };

    await expect(api.app.getInfo()).resolves.toEqual({
      ok: true,
      data: {
        name: 'Arima',
        version: '0.1.0',
        platform: 'darwin',
        arch: 'arm64',
      },
    });
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('app:get-info');
  });
});
