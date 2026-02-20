import classes from './style.module.css'
import { Button, Icon, Label, NumberInput, Select, Text, TextInput, useToaster, } from "@gravity-ui/uikit";
import { Eye, EyeSlash } from '@gravity-ui/icons';
import { useEffect, useState } from "react";
import { Setting } from "../../hooks/useSettings";
import { useExchange } from "../../hooks/useExchange";

interface SettingsProps {
  isOpen: boolean,
  onClose: () => void,
  setting: Setting
  onSave: (s: Setting) => Promise<void>
}

export default function Settings({ isOpen, onClose, setting, onSave }: SettingsProps) {
  const [show, setShow] = useState(false);
  const {add} = useToaster();
  const [loadingCheckConnect, setLoadingCheckConnect] = useState(false);
  const { ping } = useExchange()
  const [form, setForm] = useState(setting);

  useEffect(() => {
    setForm(setting)
  }, [setting])

  useEffect(() => {
    setForm(setting)
  }, [isOpen])

  const handleSave = async () => {
    await onSave(form)
    onClose()
  }

  const handleCheck = async () => {
    setLoadingCheckConnect(true)
    try {
      const status = await ping(form)
      if (status === 200) {
        add({ name: 'ping', title: 'Подключение успешно', theme: 'success' })
      } else if (status === 401) {
        add({ name: 'ping', title: 'Неверный логин или пароль', theme: 'danger' })
      } else {
        add({ name: 'ping', title: 'Неизвестная ошибка', content: `Код ответа: ${status}`, theme: 'warning' })
      }
    } catch (e) {
      add({ name: 'ping', title: 'Неизвестная ошибка', content: `Возможно не верный сервер`, theme: 'warning' })
    }

    setLoadingCheckConnect(false)
  }

  return (
    <>
      {isOpen && <div className={classes.overlay} onClick={onClose}/>}
        <div className={`${classes.settings} ${isOpen ? classes.open : ''}`}>
          <div className={classes.header}><Text variant={"header-1"}>Настройки</Text></div>
          <div className={classes.input}>
            <TextInput
              placeholder="https://owa.lemanapro.ru/"
              size={"l"}
              label={"Сервер:"}
              value={form.server}
              onUpdate={(v) => setForm(prev => ({ ...prev, server: v }))}
            />
          </div>
          <div className={classes.input}>
            <TextInput
              label={"Логин:"}
              size={"l"}
              value={form.login}
              onUpdate={(v) => setForm(prev => ({ ...prev, login: v }))}
            />
          </div>
          <div className={classes.input}>
            <TextInput label={"Пароль:"} size={"l"}
                       type={show ? 'text' : 'password'}
                       endContent={
                         <Button view="flat" onClick={() => setShow(prev => !prev)}>
                           <Icon data={show ? EyeSlash : Eye} size={16}/>
                         </Button>
                       }
                       value={form.password}
                       onUpdate={(v) => setForm(prev => ({ ...prev, password: v }))}
            />
          </div>
          <div className={classes.input}>
            <NumberInput label={"Интервал обновления"}
                         size={"l"}
                         max={60}
                         min={2}
                         defaultValue={15}
                         endContent={<Label size="s">мин</Label>}
                         value={form.interval}
                         onUpdate={(v) => setForm(prev => ({ ...prev, interval: v ?? 15 }))}
            />
          </div>
          <div className={classes.input}>
            <Select multiple={true}
                    hasCounter={true}
                    label={"Уведомить за:"}
                    hasClear={true}
                    width={"max"}
                    size={"l"}
                    value={form.notifications}
                    onUpdate={(v) => setForm(prev => ({ ...prev, notifications: v }))}
            >
              <Select.Option value="1">1м</Select.Option>
              <Select.Option value="2">2м</Select.Option>
              <Select.Option value="5">5м</Select.Option>
              <Select.Option value="10">10м</Select.Option>
              <Select.Option value="15">15м</Select.Option>
              <Select.Option value="20">20м</Select.Option>
              <Select.Option value="30">30м</Select.Option>
              <Select.Option value="40">40м</Select.Option>
              <Select.Option value="60">1ч</Select.Option>
            </Select>
          </div>
          <Text variant={"caption-1"} color={"secondary"}>
            * Данные хранятся локально на вашем устройстве и никуда не передаются
          </Text>

          <div className={classes.button}>
            <Button loading={loadingCheckConnect} onClick={handleCheck} size={"l"} width={"max"}>Проверить подключение</Button>
          </div>
          <div className={classes.button}>
            <Button onClick={handleSave} view={"action"} size={"l"} width={"max"}>Сохранить</Button>
          </div>

        </div>
    </>
  )
}