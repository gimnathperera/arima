import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IpcMainInvokeEvent } from 'electron';

const isTrustedRendererSender = vi.fn();
const getVersion = vi.fn();

vi.mock('electron', () => ({
  app: {
    getVersion,
  },
}));

vi.mock('@main/security', () => ({
  isTrustedRendererSender,
}));

describe('main IPC handlers', () => {
  beforeEach(() => {
    isTrustedRendererSender.mockReset();
    getVersion.mockReturnValue('0.1.0');
  });

  it('returns structured app info', async () => {
    const { getAppInfo } = await import('@main/ipc');

    expect(getAppInfo()).toEqual({
      ok: true,
      data: {
        name: 'Arima',
        version: '0.1.0',
        platform: process.platform,
        arch: process.arch,
      },
    });
  });

  it('rejects untrusted IPC senders', async () => {
    const { requireTrustedSender } = await import('@main/ipc');
    isTrustedRendererSender.mockReturnValue(false);

    const result = requireTrustedSender({
      sender: { getURL: () => 'https://example.test' },
    } as Pick<IpcMainInvokeEvent, 'sender'>);

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'IPC_FORBIDDEN_SENDER',
        message: 'This application window is not allowed to use that operation.',
        retryable: false,
      },
    });
  });
});
