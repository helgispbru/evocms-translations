# Модуль Translations для Evolution CMS

_дописать!_

Добавление языков интерфейса:

1. `src/constants/locales.js` список для выпадающего меню выбора языка
2. `src/locales/[lang]/[group].js` добавить файл с переводами сообщений
3. `src/views/PageLanguages.vue` (1) добавить импорт языка для таблицы
4. `src/views/PageLanguages.vue` (2) добавить маппинг языков в переменную `dtLangMap`
5. `src/main.js` (1) загрузить языки сообщений для VeeValidate
6. `src/main.js` (2) подключить языки сообщений для VeeValidate

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

Также [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) для поддержки управления языками

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Данные mock лежат в папке `/mock`:

- `db.json` - база
- `langs.js` - роутинг и обработка

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
