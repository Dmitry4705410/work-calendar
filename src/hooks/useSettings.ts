import { useState, useEffect } from 'react'

export interface Setting {
  server: string
  login: string
  password: string
  interval: number | null
  notifications: string[],
  hidePastMeetings: boolean,
  doNotDisturb: boolean
}

const defaultSettings: Setting = {
  server: '',
  login: '',
  password: '',
  interval: 15 ,
  notifications: [],
  hidePastMeetings: false,
  doNotDisturb: false
}

export function useSettings() {
  const [settings, setSettings] = useState<Setting>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI.getStore('settings').then((saved) => {
      if (saved) setSettings(saved)
      setLoading(false)
    })
  }, [])

  const save = async (newSettings: Setting) => {
    setSettings(newSettings)
    await window.electronAPI.setStore('settings', newSettings)
  }

  return { settings, save, loading }
}