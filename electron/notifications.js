const { Notification, shell } = require('electron')

let notifiedMap = {}
let store = null
let notificationTimer = null

function init(storeInstance) {
  store = storeInstance
  loadNotifiedMap()
  start()
}

function loadNotifiedMap() {
  const today = new Date().toISOString().slice(0, 10)
  const saved = store.get('notifiedMap', {})
  if (saved.date !== today) {
    notifiedMap = {}
    store.set('notifiedMap', { date: today, data: {} })
  } else {
    notifiedMap = saved.data ?? {}
  }
}

function saveNotifiedMap() {
  const today = new Date().toISOString().slice(0, 10)
  store.set('notifiedMap', { date: today, data: notifiedMap })
}

function isNotified(meetingId, minutesBefore) {
  return notifiedMap[meetingId]?.includes(minutesBefore) ?? false
}

function markNotified(meetingId, minutesBefore) {
  if (!notifiedMap[meetingId]) notifiedMap[meetingId] = []
  notifiedMap[meetingId].push(minutesBefore)
  saveNotifiedMap()
}

function sendNotification(title, body, url) {
  if (!Notification.isSupported()) return
  const notification = new Notification({ title, body })
  if (url) notification.on('click', () => shell.openExternal(url))
  notification.show()
}

function check() {

  const items = store.get('calendarItems', [])
  const settings = store.get('settings', {})
  const notificationMinutes = settings.notifications ?? []

  if (!items.length || !notificationMinutes.length) return

  const now = new Date()
  console.log(now)
  for (const item of items) {
    if (item.IsCancelled) continue

    const start = new Date(item.start)

    for (const min of notificationMinutes) {
      const minutes = parseInt(min, 10)
      if (isNaN(minutes)) continue

      const notifyAt = new Date(start.getTime() - minutes * 60_000)
      const msUntilNotify = notifyAt.getTime() - now.getTime()

      if (msUntilNotify >= -30_000 && msUntilNotify <= 30_000) {
        if (!isNotified(item.id, minutes)) {
          markNotified(item.id, minutes)
          const label = minutes >= 60 ? `${minutes / 60}ч` : `${minutes}м`
          const url = item.location || null
          sendNotification(`⏰ Встреча через ${label}`, item.subject, url)
        }
      }
    }
  }
}

function start() {
  if (notificationTimer) clearInterval(notificationTimer)
  check()
  notificationTimer = setInterval(check, 30_000)
}

function destroy() {
  if (notificationTimer) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

module.exports = { init, destroy }