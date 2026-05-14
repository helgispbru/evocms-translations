import { TOAST_OPTIONS } from '@/constants/toasts'
import { URL_PATH } from '@/constants/settings'

import { useToast } from 'vue-toast-notification'
const $toast = useToast()

export const onImport = async (t) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
    }
    const response = await fetch(`${URL_PATH}/import`, options)
    const data = await response.json()

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)
      throw error
    }

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

    throw err
  }
}

export const onExport = async (t) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
    }
    const response = await fetch(`${URL_PATH}/export`, options)
    const data = await response.json()

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)
      throw error
    }

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

    throw err
  }
}

// список групп с paginator
export const getGroups = async (t) => {
  const path = 'groups'
  const url = `${URL_PATH}/${path}`

  const options = {
    method: 'GET',
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

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      // $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)
      throw error
    }

    // преобразовать
    if (data.data.length) {
      return data.data
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

// список групп без paginator
export const getGroupsList = async (t) => {
  const path = 'groups/list'
  const url = `${URL_PATH}/${path}`

  const options = {
    method: 'GET',
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

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      const errorText = data?.error || `${response.status} ${response.statusText}`

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      // $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)
      throw error
    }

    // преобразовать
    if (data.length) {
      return data
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
