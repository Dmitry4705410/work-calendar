interface Window {
  electronAPI: {
    closeWindow: () => void
    minimizeWindow: () => void
    getStore: (key: string) => Promise<any>
    setStore: (key: string, value: any) => Promise<void>
    openExternal: (url: string) => Promise<void>
  }
}