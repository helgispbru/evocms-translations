import { emitter } from '@/utils/emitter'

import {
  tabulatorHandleRowDelete,
} from '@/composable/tabulator-methods'

import { library, icon } from '@fortawesome/fontawesome-svg-core'
// кнопки в таблице
import { faTrash, faXmark, } from '@fortawesome/free-solid-svg-icons'
library.add(faTrash, faXmark,)

// обработчик нажатия на кнопку
const handleButtonClick = async (action, page, cell, t) => {
  const row = cell.getRow()
  const tabulator = row.getTable()

  const pages = {
    language: {
      tr: 'language',
      path: 'languages',
    },
    group: {
      tr: 'group',
      path: 'groups',
    }
  }

  switch (action) {
    // отмена
    case 'cancel':
      tabulator.deleteRow(row)
      emitter.emit(`tabulator:${page}:cancel-add`)
      break

    // удалить строку
    case 'delete':
      await tabulatorHandleRowDelete(cell, {
        t,
        tr: pages[page].tr,
        path: pages[page].path
      })
      break
  }
}

// создание кнопок в строке
export const actionFormatter = (cell, formatterParams, onRendered) => {
  const row = cell.getRow()
  const rowData = row.getData()

  const container = document.createElement('div')

  const actions = [
    // отмена
    { action: 'cancel', icon: faXmark, },
    // удалить
    { action: 'delete', icon: faTrash, },
  ]

  const { t, page } = formatterParams
  const btns = {}

  actions.forEach((el) => {
    const button = document.createElement('button')

    const svgIcon = icon(el.icon)
    button.appendChild(svgIcon.node[0])

    const classes = ['btn', 'btn-link', 'text-secondary', 'py-0']
    button.classList.add(...classes)

    button.addEventListener('click', (e) => {
      e.stopPropagation()
      handleButtonClick(el.action, page, cell, t)
    })

    btns[el.action] = button
  })

  // новая строка
  if (rowData._isNew) {
    // отмена
    container.appendChild(btns.cancel)
  }

  // редактировать строку
  if (!rowData._isNew) {
    // удалить
    container.appendChild(btns.delete)
  }

  onRendered(() => {
    // console.log('onRendered', rowData)
  })

  return container
}
