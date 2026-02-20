import classes from './style.module.css'
import { Icon, Text } from "@gravity-ui/uikit";
import {Xmark, Minus, Sliders, ArrowsRotateLeft} from '@gravity-ui/icons';

interface HeaderProps {
  onSettingsClick: () => void,
  onRefresh: () => void
}

export default function Header({ onSettingsClick, onRefresh }: HeaderProps) {
  return (
    <div className={classes.header}>
      <div className={classes.headerItems}>
        <div className={classes.logo}>
          <Text className={classes.logo} variant={"display-1"} color={"warning"}>
            Календарь
          </Text>
        </div>
        <div>
          <div className={classes.headerRight}>
            <div onClick={onRefresh}>
              <Icon className={classes.refresh} data={ArrowsRotateLeft} size={20} color={"warning"}/>
            </div>
            <div onClick={onSettingsClick}>
              <Icon className={classes.settings} data={Sliders} size={20} color={"warning"}/>
            </div>
            <div onClick={() => window.electronAPI.minimizeWindow()}>
              <Icon className={classes.hide} data={Minus} size={20} color={"warning"}/>
            </div>
            <div onClick={() => window.electronAPI.closeWindow()}>
              <Icon className={classes.close} data={Xmark} size={20} color={"warning"}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}