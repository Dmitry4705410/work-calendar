const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  getStore: (key) => ipcRenderer.invoke('store-get', key),
  setStore: (key, value) => ipcRenderer.invoke('store-set', key, value),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (_, progress) => callback(progress)),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_, msg) => callback(msg)),
  downloadUpdate: () => ipcRenderer.invoke('update-download'),
  installUpdate: () => ipcRenderer.invoke('update-install'),
})