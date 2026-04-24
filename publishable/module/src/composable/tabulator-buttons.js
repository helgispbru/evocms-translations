import { h, render } from 'vue'

import { emitter } from '@/utils/emitter'

import { useBsConfirmation } from '@/composable/useBsConfirmation'
const { show } = useBsConfirmation()

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// кнопки в таблице
import { faTrash, faXmark, } from '@fortawesome/free-solid-svg-icons'
library.add(faTrash, faXmark,)


import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

import { URL_PATH } from '@/constants/settings'

// обработчик удаления строки
async function handleRowDelete(id, row, t) {
  let tabulator = row.getTable()

  const url = `${URL_PATH}/languages/${id}`

  const confirmed = await show({
    title: t('language.modal.delete'),
    message: t('language.modal.deletemsg'),
    okButton: t('btn.delete'),
    cancelButton: t('btn.cancel'),
  })

  if (!confirmed) {
    return false
  }

  try {
    // loading
    row.getElement().style.opacity = '0.5'

    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
      // body: JSON.stringify(saveData),
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      // redirect: 'follow' // manual, *follow, error
    }
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`
      const { errors } = data

      Object.values(errors)
        .flat()
        .forEach((el) => $toast.warning(el, TOAST_OPTIONS))

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      // $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)

      // stop loading
      row.getElement().style.opacity = ''
      throw error
    }

    $toast.success(t('language.toast.deleted'), TOAST_OPTIONS)

    // stop loading
    row.getElement().style.opacity = '0.25'
    tabulator.deleteRow(id)
    return true
  } catch (err) {
    if (err.name === 'TypeError') {
      // network errors (failed to fetch)
      // console.error(t('toast.errornetwork'), error.message)
      $toast.error(`${t('toast.errornetwork')} ${err.message}`, TOAST_OPTIONS)
    } else {
      // other errors
      // console.error(t('toast.error'), error.message)
      $toast.error(`${t('toast.error')} ${err.message}`, TOAST_OPTIONS)
    }

    // stop loading
    row.getElement().style.opacity = ''
    throw err
  }
}

// обработчик нажатия на кнопку
const handleButtonClick = async (action, id, row, t) => {
  let tabulator = row.getTable()

  switch (action) {
    // отмена
    case 'cancel':
      tabulator.deleteRow(row)
      emitter.emit('tabulator:reset-add')
      break
    // удалить строку
    case 'delete':
      await handleRowDelete(id, row, t)
      break
  }
}

// создание кнопок в строке
export const actionFormatter = (cell, formatterParams, onRendered) => {
  // const id = cell.getValue()
  const row = cell.getRow()
  // const rowData = row.getData()

  const container = document.createElement('div')

  const actions = [
    // отмена
    { icon: faXmark, action: 'cancel' }, // , color: ''
    // удалить
    { icon: faTrash, action: 'delete' }, // , color: '#e74c3c'
  ]

  const t = formatterParams.t
  const btns = {}

  actions.forEach((el) => {
    const button = document.createElement('button')

    button.dataset.action = el.action
    button.dataset.id = cell.getValue()

    const iconVNode = h(FontAwesomeIcon, {
      icon: el.icon,
    })
    render(iconVNode, button)

    const classes = ['btn', 'btn-link', 'text-secondary', 'py-0']
    button.classList.add(...classes)
    button.onclick = () => handleButtonClick(el.action, cell.getValue(), row, t)

    btns[el.action] = button

    onRendered(() => {
      if (cell.getRow().getData()._isNew) {
        container.appendChild(btns.cancel)
      } else {
        //container.appendChild(btns.create)
        //if (id == -1) {
        //  container.appendChild(btns.cancel)
        //}
        container.appendChild(btns.delete)
      }
    })
  })

  return container
}
