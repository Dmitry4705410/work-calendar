import classes from './style.module.css'
import App from './App'
import { configure, ThemeProvider, Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import './index.css'
import ReactDOM from 'react-dom/client';
import React from 'react';

configure({
  lang: 'ru',
});

const toaster = new Toaster();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToasterProvider toaster={toaster}>
    <ThemeProvider theme="dark">
      <App/>
      <ToasterComponent className={classes.toaster} />
    </ThemeProvider>
    </ToasterProvider>
  </React.StrictMode>
)