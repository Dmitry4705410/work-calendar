import { useEffect, useState } from 'react'
import { useToaster } from '@gravity-ui/uikit'

export type UpdateStatus = 'idle' | 'available' | 'downloading' | 'ready' | 'error'

export function useUpdater() {
  const { add } = useToaster()
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    const api = window.electronAPI

    api.onUpdateAvailable((info: { version: string }) => {
      setUpdateStatus('available')
      add({
        name: 'update-available',
        title: `Доступно обновление v${info.version}`,
        content: 'Откройте настройки для установки',
        theme: 'info',
      })
    })

    api.onUpdateProgress((progress: { percent: number }) => {
      setUpdateStatus('downloading')
      setDownloadProgress(Math.round(progress.percent))
    })

    api.onUpdateDownloaded(() => {
      setUpdateStatus('ready')
      add({
        name: 'update-ready',
        title: 'Обновление загружено',
        content: 'Нажмите "Установить" в настройках',
        theme: 'success'
      })
    })

    api.onUpdateError((msg: string) => {
      setUpdateStatus('error')
      add({
        name: 'update-error',
        title: 'Ошибка обновления',
        content: msg,
        theme: 'danger',
      })
    })

    return () => {
      api.removeAllUpdateListeners?.()
    }
  }, [])

  const downloadUpdate = async () => {
    setUpdateStatus('downloading')
    await window.electronAPI.downloadUpdate()
  }

  const installUpdate = () => {
    window.electronAPI.installUpdate()
  }

  return { updateStatus, downloadProgress, downloadUpdate, installUpdate }
}