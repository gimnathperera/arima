import type { AppInfo } from './app-info';
import type { Result } from './result';

export type ArimaApi = {
  app: {
    getInfo: () => Promise<Result<AppInfo>>;
  };
};
