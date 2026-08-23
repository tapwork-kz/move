const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemSpecs: () => ipcRenderer.invoke('get-system-specs'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  applyKioskSchedule: (config) => ipcRenderer.invoke('apply-kiosk-schedule', config),
  syncAstanaTime: () => ipcRenderer.invoke('sync-astana-time'),
  getKioskStatus: () => ipcRenderer.invoke('get-kiosk-status'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  isDesktop: true
});
