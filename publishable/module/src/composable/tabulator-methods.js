import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

import { library, icon } from '@fortawesome/fontawesome-svg-core'
// кнопки в таблице
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
library.add(faTrash, faPenToSquare)

import { onEditKey, onDeleteKey } from '@/composable/useBsModal'
import { useBsConfirmation } from '@/composable/useBsConfirmation'
const { show } = useBsConfirmation()

import { URL_PATH } from '@/constants/settings'

// сохранить в базу
export function saveToBackend(cell, saveData, url, method) {
  var row = cell.getRow()

  // loading
  row.getElement().style.opacity = '0.5'

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer your-token-here'
    },
    body: JSON.stringify(saveData),
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    // redirect: 'follow' // manual, *follow, error
  }

  return fetch(url, options)
    .then((response) => {
      return response
        .json()
        .then((data) => {
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

          // stop loading
          row.getElement().style.opacity = ''
          return data
        })
    })
    .catch((err) => {
      // stop loading
      row.getElement().style.opacity = ''
      throw err
    })
}

// добавить строку в таблицу
export const tabulatorAddRow = (tabulator, isAdding) => {
  if (isAdding.value) {
    return
  }

  const newRow = {
    id: -1,
    code: '',
    title: '',
    _isNew: true, // unsaved
  }

  tabulator.addRow(newRow, true)
    .then((row) => {
      setTimeout(() => {
        row.getCell('code').edit(true)
        isAdding.value = true
      }, 100)
    })
}

// форматирование строки таблицы
export const tabulatorRowFormatter = (row) => {
  const rowData = row.getData()

  // новая
  if (rowData._isNew) {
    row.getElement().classList.add('bg-info')
  } else {
    row.getElement().classList.remove('bg-info')
  }

  // редактируется
  if (rowData._isEditing) {
    row.getElement().classList.add('bg-warning')
  } else {
    row.getElement().classList.remove('bg-warning')
  }
}

export const tabulatorGroupHeaderFormatter = (value, count, data, group, extraData = {}) => {
  const { group_id, t, tabulator } = extraData

  // название
  const fragment = document.createDocumentFragment()
  fragment.appendChild(document.createTextNode(`${value}`))

  // кнопка edit
  const svgIconEdit = icon(faPenToSquare)
  const buttonEdit = document.createElement('button')
  buttonEdit.appendChild(svgIconEdit.node[0])
  buttonEdit.className = 'btn btn-sm btn-link text-secondary'
  buttonEdit.style.marginLeft = '20px'

  // кнопка delete
  const svgIconDelete = icon(faTrash)
  const buttonDelete = document.createElement('button')
  buttonDelete.appendChild(svgIconDelete.node[0])
  buttonDelete.className = 'btn btn-sm btn-link text-secondary'

  buttonEdit.addEventListener('click', (e) => {
    // VERY IMPORTANT: prevents the group from toggling open/closed when the button is clicked
    e.stopPropagation()

    onEditKey(group_id, value, t).then((res) => {
      // res.saved
      // res.group_id

      if (res.saved) {
        $toast.success(t('entry.toast.created'), TOAST_OPTIONS)
        // update
        tabulator.setData()
      }
    })
  })

  buttonDelete.addEventListener('click', (e) => {
    // VERY IMPORTANT: prevents the group from toggling open/closed when the button is clicked
    e.stopPropagation()

    onDeleteKey(group_id, value, t).then((res) => {
      // res.deleted
      // res.group_id

      if (res.deleted) {
        $toast.success(t('entry.toast.deleted'), TOAST_OPTIONS)
        // update
        tabulator.setData()
      }
    })
  })

  fragment.appendChild(buttonEdit)
  fragment.appendChild(buttonDelete)

  return fragment
}

// событие процесс редактирования
export const tabulatorEventCellEditing = (cell) => {
  const row = cell.getRow()
  const rowData = row.getData()

  rowData._isEditing = true
  row.update(rowData)

  const actionCell = row.getCell('id')
  const currentValue = actionCell.getValue()
  actionCell.setValue(currentValue)
}

// событие отмена редактирования
export const tabulatorEventCellEditCancelled = (cell) => {
  const row = cell.getRow()
  const rowData = row.getData()

  rowData._isEditing = false
  row.update(rowData)

  const actionCell = row.getCell('id')
  const currentValue = actionCell.getValue()
  actionCell.setValue(currentValue)
}

// событие редактирование закончено - для языка или группы
export const tabulatorEventCellEdited = (cell, extraData = {}) => {
  const row = cell.getRow()
  const rowData = cell.getRow().getData()
  const rowId = rowData.id

  let code = undefined
  let title = undefined
  const errors = []

  const { t, tr, url, isAdding } = extraData

  if (rowData._isNew) {
    // новая строка
    switch (cell.getField()) {
      case 'code':
        code = cell.getValue().trim()
        if (!code) {
          errors.push(t(tr + '.form.error.nocode'))
        }
        break
      case 'title':
        title = cell.getValue().trim()
        if (!title) {
          errors.push(t(tr + '.form.error.notitle'))
        }
        break
    }
  } else {
    // обновление строки
    code = rowData?.code?.trim()
    title = rowData?.title?.trim()

    if (!code) {
      errors.push(t(tr + '.form.error.nocode'))
    }
    if (!title) {
      errors.push(t(tr + '.form.error.notitle'))
    }
  }

  if (errors.length > 0) {
    errors.forEach((el) => $toast.warning(el, TOAST_OPTIONS))
    cell.restoreOldValue()
    return false
  }

  let saveData = {}

  // не сохранять для новых строк, которые еще не были нормально сохранены
  if (rowData._isNew) {
    code = rowData?.code?.trim()
    title = rowData?.title?.trim()

    if (code && title) {
      // создать новую строку в таблице
      saveData = Object.assign(saveData, {
        code,
        title,
      })

      // сохранить строку
      saveToBackend(cell, saveData, url, 'POST')
        .then((data) => {
          row
            .update({
              id: data.id, // новый id
              _isNew: false,
              _isEditing: false,
            })
            .then(() => {
              row.reformat()
            })

          $toast.success(t(tr + '.toast.created'), TOAST_OPTIONS)
          isAdding.value = false
        })
        .catch((error) => {
          if (error.name === 'TypeError') {
            $toast.error(`${t('toast.errornetwork')} ${error.message}`, TOAST_OPTIONS)
          } else {
            $toast.error(`${t('toast.error')} ${error.message}`, TOAST_OPTIONS)
          }

          // если ошибки, то вернуть к редактированию
          setTimeout(() => cell.edit(true), 100)
        })
    }
    return
  }

  // обновить строку в базе
  saveData = Object.assign(saveData, {
    [cell.getField()]: cell.getValue(),
  })

  // сохранить ячейку
  saveToBackend(cell, saveData, `${url}/${rowId}`, 'PATCH')
    .then((data) => {
      row
        .update({
          id: data.id, // новый id
          _isEditing: false,
        })
        .then(() => {
          row.reformat()
        })

      $toast.success(t(tr + '.toast.edited'), TOAST_OPTIONS)
    })
    .catch((error) => {
      if (error.name === 'TypeError') {
        $toast.error(`${t('toast.errornetwork')} ${error.message}`, TOAST_OPTIONS)
      } else {
        $toast.error(`${t('toast.error')} ${error.message}`, TOAST_OPTIONS)
      }

      // восстановить старое значение
      cell.restoreOldValue()
    })
}

export const tabulatorEventCellEditedEntry = (cell, extraData = {}) => {
  const row = cell.getRow()
  const rowData = cell.getRow().getData()
  const rowId = rowData.id

  let value = undefined
  const errors = []

  const { t, tr, url } = extraData

  // обновление строки
  value = rowData?.value?.trim()

  if (errors.length > 0) {
    errors.forEach((el) => $toast.warning(el, TOAST_OPTIONS))
    cell.restoreOldValue()
    return false
  }

  let saveData = {}

  // обновить строку в базе
  saveData = Object.assign(saveData, {
    id: rowData.id,
    language_id: rowData.language_id,
    language_group_id: rowData.language_group_id,
    key: rowData.key,
    value,
  })

  // сохранить ячейку
  saveToBackend(cell, saveData, `${url}/${rowId}`, 'PATCH')
    .then((data) => {
      row
        .update({
          id: data.id, // новый id
          _isEditing: false,
        })
        .then(() => {
          row.reformat()
        })

      $toast.success(t(tr + '.toast.edited'), TOAST_OPTIONS)
    })
    .catch((error) => {
      if (error.name === 'TypeError') {
        $toast.error(`${t('toast.errornetwork')} ${error.message}`, TOAST_OPTIONS)
      } else {
        $toast.error(`${t('toast.error')} ${error.message}`, TOAST_OPTIONS)
      }

      // восстановить старое значение
      cell.restoreOldValue()
    })
}

// обработчик удаления строки
export const tabulatorHandleRowDelete = async (cell, extraData = {}) => {
  const { t, tr, path } = extraData

  const id = cell.getValue()
  const row = cell.getRow()
  const tabulator = row.getTable()

  const url = `${URL_PATH}/${path}/${id}`

  const confirmed = await show({
    title: t(tr + '.modal.delete'),
    message: t(tr + '.modal.deletemsg'),
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

    $toast.success(t(tr + '.toast.deleted'), TOAST_OPTIONS)

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
