interface Window {
  electronAPI: {
    closeWindow: () => void
    minimizeWindow: () => void
    getStore: (key: string) => Promise<any>
    setStore: (key: string, value: any) => Promise<void>
    openExternal: (url: string) => Promise<void>

    // Auto-updater
    onUpdateAvailable: (callback: (info: { version: string }) => void) => void
    onUpdateDownloaded: (callback: () => void) => void
    onUpdateProgress: (callback: (progress: { percent: number }) => void) => void
    onUpdateError: (callback: (message: string) => void) => void
    downloadUpdate: () => Promise<void>
    installUpdate: () => void,
    removeAllUpdateListeners: () => void
  }
}