export const ipcChannels = {
  appGetInfo: 'app:get-info',
} as const;

export type IpcChannel = (typeof ipcChannels)[keyof typeof ipcChannels];
