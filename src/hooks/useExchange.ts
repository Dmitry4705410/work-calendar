import { Setting } from './useSettings'
import { useToaster } from "@gravity-ui/uikit";

export interface CalendarItem {
  id: string
  subject: string
  start: string
  end: string
  location: string
  organizer: string
  IsCancelled: boolean
}

const extractUrl = (text: string): string => {
  const match = text.match(/https?:\/\/\S+/)
  return match ? match[0] : text
}

export function useExchange() {
  const {add} = useToaster();
  const ping = async (settings: Setting): Promise<number> => {
    const { server, login, password } = settings
    const credentials = btoa(
      new TextEncoder()
        .encode(`${login}:${password}`)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    const response = await fetch(`${server}/ews/exchange.asmx`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    })

    return response.status
  }

  const getCalendarItems = async (settings: Setting): Promise<CalendarItem[]> => {
    try {
      const { server, login, password } = settings
      const credentials = btoa(
        new TextEncoder()
          .encode(`${login}:${password}`)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      const now = new Date()
      const tzOffset = now.getTimezoneOffset()
      const tzSign = tzOffset <= 0 ? '+' : '-'
      const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0')
      const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, '0')
      const tzString = `${tzSign}${tzHours}:${tzMinutes}`

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      const toISOWithTZ = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${tzString}`
      }

      const body = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"
               xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages">
  <soap:Body>
    <m:FindItem Traversal="Shallow">
      <m:ItemShape>
        <t:BaseShape>AllProperties</t:BaseShape>
      </m:ItemShape>
      <m:CalendarView MaxEntriesReturned="100"
        StartDate="${toISOWithTZ(startOfDay)}"
        EndDate="${toISOWithTZ(endOfDay)}"/>
      <m:ParentFolderIds>
        <t:DistinguishedFolderId Id="calendar"/>
      </m:ParentFolderIds>
    </m:FindItem>
  </soap:Body>
</soap:Envelope>`

      const response = await fetch(`${server}/ews/exchange.asmx`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'text/xml',
        },
        body,
      })

      if (response.status === 200) {
        // ок, продолжаем
      } else if (response.status === 401) {
        add({ name: 'calendar-fetch', title: 'Неверный логин или пароль', theme: 'danger' })
        return []
      } else {
        add({ name: 'calendar-fetch', title: 'Неизвестная ошибка', content: `Код ответа: ${response.status}`, theme: 'warning' })
        return []
      }

      const text = await response.text()
      const parser = new DOMParser()
      const xml = parser.parseFromString(text, 'text/xml')

      const items = xml.querySelectorAll('CalendarItem')

      return Array.from(items).map((item) => {
        const get = (tag: string) => item.querySelector(tag)?.textContent ?? ''

        return {
          id: item.querySelector('ItemId')?.getAttribute('Id')!,
          subject: get('Subject'),
          start: get('Start'),
          end: get('End'),
          location: extractUrl(get('Location')),
          organizer: get('Organizer Name'),
          IsCancelled: get('IsCancelled') === 'true',
        }
      })
    } catch (e) {
      add({ name: 'calendar-fetch', title: 'Ошибка загрузки', content: 'Не удалось получить события календаря', theme: 'danger' })
      return []
    }
  }

  return { ping, getCalendarItems }
}