import { JSX, useState } from "react";
import Header from "./components/header/Header";
import Settings from "./components/sittings/Settings";
import CalendarItems from "./components/calendar-items/CalendarItems";
import { useSettings } from "./hooks/useSettings";

export default function App(): JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, save } = useSettings()
  return (
    <>
      <Header onSettingsClick={() => setSettingsOpen(prev => !prev)}/>
      <CalendarItems settings={settings} />
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        setting={settings}
        onSave={save}
      />
    </>
  )
}