const { app, BrowserWindow, ipcMain  } = require('electron')
const path = require('path')
const { shell } = require('electron')
const isDev = process.env.NODE_ENV === 'development'
let store

async function initStore() {
  const { default: Store } = await import('electron-store')
  store = new Store()
}

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 800,
    resizable: false,
    frame: false,
    show: false,
    transparent: true,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  ipcMain.on('window-close', () => win.close())
  ipcMain.on('window-minimize', () => win.minimize())

  ipcMain.handle('open-external', (_, url) => shell.openExternal(url))
  ipcMain.handle('store-get', (_, key) => store.get(key))
  ipcMain.handle('store-set', (_, key, value) => store.set(key, value))

  if (isDev) {
    win.loadURL('http://localhost:5173')
    // win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  await initStore()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})