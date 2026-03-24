const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('notificationAPI', {
  click: (id) => ipcRenderer.send(id),
  close: (id) => ipcRenderer.send(id)
})