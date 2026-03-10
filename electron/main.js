const { app, BrowserWindow, ipcMain  } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const { shell } = require('electron')
const isDev = process.env.NODE_ENV === 'development'
let store
let mainWindow

async function initStore() {
  const { default: Store } = await import('electron-store')
  store = new Store()
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = false // качаем только по запросу пользователя
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', info)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded')
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-progress', progress)
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-error', err.message)
  })

  // Проверяем обновления при старте (только в prod)
  if (!isDev) {
    autoUpdater.checkForUpdates()
  }
}


function createWindow() {
   mainWindow = new BrowserWindow({
    width: 450,
    height: 650,
    resizable: false,
    frame: false,
    show: false,
    transparent: true,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  ipcMain.on('window-close', () => mainWindow.close())
  ipcMain.on('window-minimize', () => mainWindow.minimize())

  ipcMain.handle('open-external', (_, url) => shell.openExternal(url))
  ipcMain.handle('store-get', (_, key) => store.get(key))
  ipcMain.handle('store-set', (_, key, value) => store.set(key, value))

  ipcMain.handle('update-download', () => autoUpdater.downloadUpdate())
  ipcMain.handle('update-install', () => autoUpdater.quitAndInstall())

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  await initStore()
  createWindow()
  setupAutoUpdater()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})