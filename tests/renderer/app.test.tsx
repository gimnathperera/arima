import { render, screen } from '@testing-library/react';
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
});
