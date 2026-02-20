import {JSX, useRef, useState} from "react";
import Header from "./components/header/Header";
import Settings from "./components/sittings/Settings";
import CalendarItems from "./components/calendar-items/CalendarItems";
import { useSettings } from "./hooks/useSettings";
import Bottom from "./components/bottom/Bottom";

export default function App(): JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, save } = useSettings()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const fetchRef = useRef<() => void>(() => {})
  return (
    <>
      <Header onSettingsClick={() => setSettingsOpen(prev => !prev)} onRefresh={() => fetchRef.current()}/>
      <CalendarItems settings={settings} onUpdated={() => setLastUpdated(new Date())} fetchRef={fetchRef}/>
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        setting={settings}
        onSave={save}
      />
      <Bottom lastUpdated={lastUpdated}/>
    </>
  )
}