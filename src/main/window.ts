import { join } from 'node:path';
import { BrowserWindow } from 'electron';
import { hardenWindow, secureWebPreferences } from './security';

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Arima',
    backgroundColor: '#090a0d',
    show: false,
    webPreferences: {
      ...secureWebPreferences,
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  hardenWindow(window);

  window.once('ready-to-show', () => {
    window.show();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return window;
}
