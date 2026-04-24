import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

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

  tabulator.addRow(newRow, true).then((row) => {
    setTimeout(() => {
      row.getCell('code').edit(true)
      isAdding.value = true
    }, 100)
  })
}
