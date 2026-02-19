import classes from './style.module.css'

interface CalendarItemProps {
  subject: string
  start: string
  end: string
  location?: string
  organizer: string
  isCancelled?: boolean
}

export default function CalendarItem({ subject, start, end, location, organizer, isCancelled }: CalendarItemProps) {
  console.log(start)
  console.log(end)
  const initials = organizer.split(' ').slice(0, 2).map(w => w[0]).join('')
  const isUrl = (str: string) => str.startsWith('http://') || str.startsWith('https://')

  const duration = () => {
    const s = new Date(start), e = new Date(end)
    const mins = Math.round((e.getTime() - s.getTime()) / 60000)
    return mins >= 60 ? `${Math.floor(mins/60)} ч ${mins%60 ? mins%60 + ' мин' : ''}`.trim() : `${mins} мин`
  }

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`${classes.item} ${isCancelled ? classes.cancelled : ''}`}>
      <div className={classes.accentBar}/>
      <div className={classes.content}>
        <div className={classes.topRow}>
          <span className={`${classes.subject} ${isCancelled ? classes.subjectCancelled : ''}`}>
            {subject}
          </span>
          {isCancelled
            ? <span className={classes.badgeCancelled}>Отменено</span>
            : <span className={classes.durationBadge}>{duration()}</span>
          }
        </div>
        <div className={classes.meta}>
          <div className={classes.time}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {formatTime(start)} – {formatTime(end)}
          </div>
          <div className={classes.divider}/>
          <div className={classes.organizer}>
            <div className={classes.avatar}>{initials}</div>
            {organizer}
          </div>
        </div>
        {location && !isCancelled && (
          isUrl(location)
            ? <div className={`${classes.location} ${classes.locationLink}`} onClick={() => window.electronAPI.openExternal(location)}>
              🔗 {location}
            </div>
            : <div className={classes.location}>{location}</div>
        )}
      </div>
    </div>
  )
}