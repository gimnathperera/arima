import { useEffect, useState } from 'react';
import type { AppInfo } from '@shared/app-info';

type AppInfoState =
  | { status: 'loading' }
  | { status: 'ready'; data: AppInfo }
  | { status: 'error'; message: string };

function getInitialAppInfoState(): AppInfoState {
  if (!window.arima) {
    return {
      status: 'error',
      message: 'The secure preload bridge did not load. Restart the app and check the main process logs.',
    };
  }

  return { status: 'loading' };
}

export function App(): React.JSX.Element {
  const [appInfo, setAppInfo] = useState<AppInfoState>(getInitialAppInfoState);

  useEffect(() => {
    let active = true;

    if (!window.arima) {
      return () => {
        active = false;
      };
    }

    void window.arima.app.getInfo().then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setAppInfo({ status: 'ready', data: result.data });
        return;
      }

      setAppInfo({ status: 'error', message: result.error.message });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="shell">
      <section className="panel" aria-labelledby="app-title">
        <p className="eyebrow">Arima</p>
        <h1 id="app-title">Arima</h1>
        <p className="summary">
          Secure desktop foundation is running. Media analysis, downloads, playback, and
          persistence arrive in later phases. xD
        </p>

        <dl className="facts" aria-label="Application metadata">
          <div>
            <dt>Status</dt>
            <dd>{appInfo.status === 'ready' ? 'Ready' : appInfo.status}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{appInfo.status === 'ready' ? appInfo.data.version : 'Checking...'}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>
              {appInfo.status === 'ready'
                ? `${appInfo.data.platform} ${appInfo.data.arch}`
                : 'Sandboxed preload'}
            </dd>
          </div>
        </dl>

        {appInfo.status === 'error' ? <p className="error">{appInfo.message}</p> : null}
      </section>
    </main>
  );
}
