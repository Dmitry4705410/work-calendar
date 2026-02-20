import classes from './style.module.css'
import { Text } from "@gravity-ui/uikit"
import { useEffect, useState } from "react"

export default function Bottom({ lastUpdated }: { lastUpdated: Date | null }) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => forceUpdate(n => n + 1), 10_000)
    return () => clearInterval(timer)
  }, [])

  const getLabel = () => {
    if (!lastUpdated) return 'Ещё не обновлялось'
    const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60_000)
    if (mins === 0) return 'Обновлено только что'
    return `Обновлено ${mins} мин назад`
  }

  return (
      <div className={classes.bottom}>
        <Text variant="caption-1" color="secondary">{getLabel()}</Text>
      </div>
  )
}