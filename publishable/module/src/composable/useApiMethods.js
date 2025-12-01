import { TOAST_OPTIONS } from '@/constants/toasts'
import { URL_PATH } from '@/constants/settings'

import { useToast } from 'vue-toast-notification'
const $toast = useToast()

const onImport = async (t) => {
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

const onExport = async (t) => {
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

export {
  onImport, onExport, getLanguages, getGroups
}
