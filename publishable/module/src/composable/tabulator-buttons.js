import { h, render } from 'vue'

import { emitter } from '@/utils/emitter'

import {
  tabulatorHandleRowDelete,
} from '@/composable/tabulator-methods'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
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
  const id = cell.getValue()
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

    button.dataset.action = el.action
    button.dataset.page = page
    button.dataset.id = id

    const iconVNode = h(FontAwesomeIcon, {
      icon: el.icon,
    })
    render(iconVNode, button)

    const classes = ['btn', 'btn-link', 'text-secondary', 'py-0']
    button.classList.add(...classes)
    button.onclick = () => handleButtonClick(el.action, page, cell, t)

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
