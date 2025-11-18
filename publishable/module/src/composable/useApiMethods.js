import { TOAST_OPTIONS } from '@/constants/toasts'
import { URL_PATH } from '@/constants/settings'

const onImport = async (t) => {
  const url = `${URL_PATH}/import`

  //
  return true
}

const onExport = async (t) => {
  const url = `${URL_PATH}/export`

  /*
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
      // body: JSON.stringify({}),
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      // redirect: 'follow' // manual, *follow, error
    }
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      // $toast.warning(`HTTP error! ${response.status} ${response.statusText}`, TOAST_OPTIONS)
      throw error
    }
  } catch (error) {
    if (error.name === 'TypeError') {
      // network errors (failed to fetch)
      // console.error(t('toast.errornetwork'), error.message)
      $toast.error(`${t('toast.errornetwork')} ${error.message}`, TOAST_OPTIONS)
    } else {
      // other errors
      // console.error(t('toast.error'), error.message)
      $toast.error(`${t('toast.error')} ${error.message}`, TOAST_OPTIONS)
    }

    throw error // Re-throw if you want calling code to handle it
  }
    */

  return true
}

const getLanguages = async (t) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
    }
    const response = await fetch(`${URL_PATH}/languages`, options)

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      // $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)
      throw error
    }

    const values = await response.json()

    // преобразовать
    if (values.data.length) {
      return values.data
    }
    return []
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

    throw err
  }
}

const getGroups = async (t) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
    }
    const response = await fetch(`${URL_PATH}/groups`, options)

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      // $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)
      throw error
    }

    const values = await response.json()

    // преобразовать
    if (values.data.length) {
      return values.data
    }
    return []
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

    throw err
  }
}

export {
  onImport, onExport, getLanguages, getGroups
}
