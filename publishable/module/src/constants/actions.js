/* пример структуры кнопок
{
  type: 'secondary', // цвет кнопки из bootstrap
  items: [
    // кнопка
    {
      action: 'add:entry', // действие кнопки
      title: '', // текст кнопки - заполнится из vue-i18n
      code: 'actions.addentry', // код текста кнопки для vue-i18n
      icon: 'file-lines', // иконка fontawesome 6
    },
    // разделитель
    {
      action: null, // маркер разделителя
    },
  ],
}
*/

export const ACTIONS = [
  // добавить
  {
    type: 'success',
    items: [
      {
        action: 'add:entry',
        title: '', // заполнится из vue-i18n
        code: 'actions.addentry',
        icon: 'file-lines',
      },
      {
        action: 'add:group',
        title: '', // заполнится из vue-i18n
        code: 'actions.addgroup',
        icon: 'layer-group',
      },
      {
        action: 'add:language',
        title: '', // заполнится из vue-i18n
        code: 'actions.addlanguage',
        icon: 'language',
      },
    ],
  },
  // импорт/экспорт в базу
  {
    type: 'secondary',
    items: [
      {
        action: 'db:import',
        title: '', // заполнится из vue-i18n
        code: 'actions.fileimport',
        icon: 'file-import',
      },
      {
        action: 'db:export',
        title: '', // заполнится из vue-i18n
        code: 'actions.fileexport',
        icon: 'file-export',
      },
    ],
  },
]
