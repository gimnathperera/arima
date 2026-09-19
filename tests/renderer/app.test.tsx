import { render, screen } from '@testing-library/react';
import type { ArimaApi } from '@shared/arima-api';
import { describe, expect, it } from 'vitest';
import { App } from '@renderer/ui/App';

describe('Arima renderer shell', () => {
  it('renders app metadata supplied through preload', async () => {
    window.arima = {
      app: {
        getInfo: async () => ({
          ok: true,
          data: {
            name: 'Arima',
            version: '0.1.0',
            platform: 'darwin',
            arch: 'arm64',
          },
        }),
      },
    };

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Arima' })).toBeTruthy();
    expect(await screen.findByText('0.1.0')).toBeTruthy();
    expect(screen.getByText('darwin arm64')).toBeTruthy();
  });

  it('shows a useful error instead of a blank screen when preload is missing', async () => {
    const originalApi: ArimaApi | undefined = window.arima;
    Reflect.deleteProperty(window, 'arima');

    render(<App />);

    expect(await screen.findByText(/secure preload bridge did not load/i)).toBeTruthy();

    if (originalApi) {
      window.arima = originalApi;
    }
  });
});
