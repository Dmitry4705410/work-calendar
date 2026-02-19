const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  getStore: (key) => ipcRenderer.invoke('store-get', key),
  setStore: (key, value) => ipcRenderer.invoke('store-set', key, value),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
})