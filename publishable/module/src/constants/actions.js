export const ACTIONS = [
  /* пример структуры кнопок
  {
    type: 'secondary', // цвет кнопки из bootstrap
    items: [
      // кнопка
      {
        title: '', // текст кнопки (будет загружен из языкового файла)
        code: 'actions.addentry', // код текста кнопки
        icon: 'file-lines', // иконка fontawesome 6
        action: 'add:entry', // действие кнопки
      },
      // разделитель
      {
        action: null, // маркер разделителя
      },
    ],
  }
  */
  // добавить
  {
    type: 'success',
    items: [
      {
        title: '',
        code: 'actions.addentry',
        icon: 'file-lines',
        action: 'add:entry',
      },
      {
        title: '',
        code: 'actions.addgroup',
        icon: 'layer-group',
        action: 'add:group',
      },
      {
        title: '',
        code: 'actions.addlang',
        icon: 'language',
        action: 'add:lang',
      },
    ],
  },
  // импорт/экспорт в базу
  {
    type: 'secondary',
    items: [
      {
        title: '',
        code: 'actions.fileimport',
        icon: 'file-import',
        action: 'db:import',
      },
      {
        title: '',
        code: 'actions.fileexport',
        icon: 'file-export',
        action: 'db:export',
      },
    ],
  },
]
