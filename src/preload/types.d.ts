import type { ArimaApi } from '@shared/arima-api';

declare global {
  interface Window {
    arima: ArimaApi;
  }
}

export {};
