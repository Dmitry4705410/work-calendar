import classes from './style.module.css'
import CalendarItem from "./CalendarItem"
import { Setting } from "../../hooks/useSettings"
import { CalendarItem as CalendarItemType, useExchange } from "../../hooks/useExchange"
import { useEffect, useState } from "react"
import { Loader, Text } from "@gravity-ui/uikit";
import { useToaster } from "@gravity-ui/uikit";

export default function CalendarItems({ settings, onUpdated, fetchRef }: {
  settings: Setting,
  onUpdated: () => void,
  fetchRef: React.MutableRefObject<() => void>
}) {
  const { getCalendarItems } = useExchange();
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CalendarItemType[]>([])
  const [initialized, setInitialized] = useState(false);
  const {add} = useToaster();

  const fetch = async () => {
    setLoading(true)
    const result = await getCalendarItems(settings)
    setItems(result)
    await window.electronAPI.setStore('calendarItems', result)
    setLoading(false)
    onUpdated()
  }

  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      setLoading(false)
      return
    }
    if (!settings.server || !settings.login || !settings.password) {
      add({ name: 'settings_empty', title: 'Заполните данные в настройках', theme: 'warning' })
      setLoading(false)
      return
    }
    fetchRef.current = fetch
    fetch()

    const interval = (settings.interval ?? 15) * 60 * 1000
    const timer = setInterval(fetch, interval)

    return () => clearInterval(timer)
  }, [settings])

  return (
    <div className={classes.calendarItems}>
      <div className={classes.header}>
        <Text variant={"header-1"}>
          Расписание
        </Text>
      </div>
      <div className={classes.calendarItems}>
        {loading ? (
            <div className={classes.empty}>
              <Loader size="m"/>
            </div>
          ) :
        items.length === 0 ? (
          <div className={classes.empty}>
            <Text variant={"subheader-1"}>
              Встречи не найдены
            </Text>
          </div>
        ) : (
          items.map((item, i) => (
            <CalendarItem
              key={i}
              subject={item.subject}
              start={item.start}
              end={item.end}
              location={item.location}
              organizer={item.organizer}
              isCancelled={item.IsCancelled}
            />
          ))
        )}
      </div>
    </div>
  )
}