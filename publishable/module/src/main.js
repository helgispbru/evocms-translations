import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle';
import './assets/bootstrap.scss'

// какое оформление взять для оповещений (выбрать)
// import 'vue-toast-notification/dist/theme-default.css'
import 'vue-toast-notification/dist/theme-bootstrap.css'
// import 'vue-toast-notification/dist/theme-sugar.css'

// стили бутстрапа для таблицы datatables
import 'datatables.net-bs5/css/dataTables.bootstrap5.css'
// стили ColumnControls
import 'datatables.net-columncontrol-dt/css/columnControl.dataTables.css'

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { loadLocaleMessages, fallbackLocale } from './i18n'

import { defineRule, configure } from 'vee-validate'
// правила валидации
import { required, max } from '@vee-validate/rules'
defineRule('required', required)
defineRule('max', max)
// сообщения локализация
import { localize } from '@vee-validate/i18n'
// (1) загрузить языки сообщений для VeeValidate
import en from '@vee-validate/i18n/dist/locale/en.json';
import ru from '@vee-validate/i18n/dist/locale/ru.json';
configure({
  generateMessage: localize({
    // (2) подключить языки сообщений для VeeValidate
    en,
    ru,
  }),
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.provide('bootstrap', bootstrap);

loadLocaleMessages(i18n, fallbackLocale).then(() => {
  app.mount('#app');
});
