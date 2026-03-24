const { BrowserWindow, screen, shell, ipcMain } = require('electron')
const path = require('path')

const WIDTH = 360
const HEIGHT = 110
const MARGIN = 12

let windows = []

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('')
}

function formatDuration(startStr, endStr) {
  const mins = Math.round((new Date(endStr) - new Date(startStr)) / 60000)
  return mins >= 60
      ? `${Math.floor(mins / 60)} ч ${mins % 60 ? mins % 60 + ' мин' : ''}`.trim()
      : `${mins} мин`
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function repositionAll() {
  windows.forEach((w, i) => {
    if (!w.isDestroyed()) {
      const y = MARGIN + i * (HEIGHT + MARGIN)
      w.setPosition(w.getPosition()[0], y)
    }
  })
}

function closeWin(win) {
  if (!win.isDestroyed()) win.close()
}

function buildHtml(item, minutesBefore, clickId, closeId) {
  const label = minutesBefore >= 60 ? `${minutesBefore / 60}ч` : `${minutesBefore}м`
  const duration = formatDuration(item.start, item.end)
  const time = `${formatTime(item.start)} – ${formatTime(item.end)}`
  const initials = getInitials(item.organizer)
  const hasLink = !!clickId

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: transparent;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    user-select: none;
  }
  .wrap {
    width: 360px;
    background: rgb(34, 29, 34);
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.07);
    padding: 14px 16px;
    display: flex;
    gap: 14px;
    align-items: stretch;
    cursor: ${hasLink ? 'pointer' : 'default'};
    animation: slideIn 1s ease;
    position: relative;
  }
  @keyframes slideIn {
    from { transform: translateX(30px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  .bar {
    width: 3px;
    border-radius: 2px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #f5a623, #e07b00);
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding-right: 16px;
  }
  .subject {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.92);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .badge {
    font-size: 10px;
    font-weight: 600;
    color: rgba(245,166,35,0.8);
    background: rgba(245,166,35,0.08);
    border-radius: 4px;
    padding: 2px 6px;
    flex-shrink: 0;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .time {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    font-weight: 500;
  }
  .divider {
    width: 1px;
    height: 10px;
    background: rgba(255,255,255,0.1);
  }
  .organizer {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    overflow: hidden;
  }
  .avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f5a623, #e07b00);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    line-height: 1;
    letter-spacing: -0.5px;
  }
  .location {
    font-size: 11px;
    color: rgba(245,166,35,0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hint {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
  }
  .close {
    position: absolute;
    top: 8px;
    right: 10px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.3;
    transition: opacity 0.15s;
  }
   .timer {
    position: absolute;
    bottom: 0;
    left: 5%;
    height: 4px;
    width: 90%;
    background: rgba(245,166,35,0.8);
    border-radius: 0 0 16px 16px;
    animation: timerAnim 60s linear forwards;
  }

  @keyframes timerAnim {
    from { width: 90%; opacity: 1; }
    to   { width: 0%; opacity: 0.2; }
  }

  .close:hover { opacity: 0.8; }
</style>
</head>
<body>
  <div class="wrap" id="wrap">
    <div class="close" id="close">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <line x1="1" y1="1" x2="9" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="9" y1="1" x2="1" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="bar"></div>
    <div class="content">
      <div class="top-row">
        <span class="subject">${item.subject}</span>
        <span class="badge">${duration}</span>
      </div>
      <div class="meta">
        <div class="time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          ${time}
        </div>
        <div class="divider"></div>
        <div class="organizer">
          <div class="avatar">${initials}</div>
          ${item.organizer}
        </div>
      </div>
      ${hasLink ? `
        <div class="location">🔗 ${item.location}</div>
        <div class="hint">⏰ через ${label} · нажмите чтобы открыть</div>
      ` : `
        <div class="hint">⏰ через ${label}</div>
      `}
    </div>
    <div class="timer"></div>
  </div>
  <script>
    document.getElementById('close').addEventListener('click', (e) => {
      e.stopPropagation()
      window.notificationAPI.close('${closeId}')
    })
    ${hasLink ? `
    document.getElementById('wrap').addEventListener('click', () => {
      window.notificationAPI.click('${clickId}')
    })
    ` : ''}
  </script>
</body>
</html>`
}

function showNotification(item, minutesBefore) {
  const { width } = screen.getPrimaryDisplay().workAreaSize
  const hasLink = item.location && item.location.startsWith('http')
  const ts = Date.now()
  const clickId = hasLink ? `notif-click-${ts}` : null
  const closeId = `notif-close-${ts}`

  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x: width - WIDTH - MARGIN,
    y: MARGIN + windows.length * (HEIGHT + MARGIN),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'notificationPreload.js')
    }
  })

  if (clickId) {
    ipcMain.once(clickId, () => {
      shell.openExternal(item.location)
      closeWin(win)
    })
  }

  ipcMain.once(closeId, () => closeWin(win))

  windows.push(win)
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(buildHtml(item, minutesBefore, clickId, closeId))}`)

  const timer = setTimeout(() => closeWin(win), 60000)

  win.on('closed', () => {
    clearTimeout(timer)
    if (clickId) ipcMain.removeAllListeners(clickId)
    ipcMain.removeAllListeners(closeId)
    windows = windows.filter(w => w !== win)
    repositionAll()
  })
}

module.exports = { showNotification }