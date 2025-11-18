import { defineAsyncComponent } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useBsConfirmation } from '@/composable/useBsConfirmation.js'
import { TOAST_OPTIONS } from '@/constants/toasts'
import { URL_PATH } from '@/constants/settings'
import { getLanguages, getGroups } from './useApiMethods'

// --- language

const onAddLang = async (t) => {
  const obj = {
    action: 'add',
    id: 0,
    code: '',
    title: '',
  }

  const modalStore = useModalStore()

  modalStore.setTitle(t('languages.modal.add'))
  modalStore.setSize('md')
  modalStore.setData(obj)

  const result = await modalStore.open(
    defineAsyncComponent({
      loader: () => import('@/components/modals/lang.vue'),
      // loadingComponent: LoadingProcess,
      // delay: timeoutLoad, // default: 200ms
      // errorComponent: LoadingError,
      // timeout: timeoutError // default: infinity
    }),
    [
      // actions
    ]
  )

  return result?.saved ?? false
}

const onEditLang = async (t, obj) => {
  const modalStore = useModalStore()

  modalStore.setTitle(t('languages.modal.edit'))
  modalStore.setSize('md')
  modalStore.setData(obj)

  const result = await modalStore.open(
    defineAsyncComponent({
      loader: () => import('@/components/modals/lang.vue'),
      // loadingComponent: LoadingProcess,
      // delay: timeoutLoad, // default: 200ms
      // errorComponent: LoadingError,
      // timeout: timeoutError // default: infinity
    }),
    [
      // actions
    ]
  )

  return result?.saved ?? false
}

const onDeleteLang = async (t, obj, $toast) => {
  const { show: dialogShow } = useBsConfirmation()

  const ok = await dialogShow({
    title: t('languages.modal.delete'),
    message: t('languages.modal.deletemsg'),
    okButton: t('btn.delete'),
    cancelButton: t('btn.cancel'),
  })

  if (!ok) {
    console.log('Not confirmed...')
    return false
  }

  const url = `${URL_PATH}/languages/${obj.id}`

  try {
    const options = {
      method: 'DELETE',
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

    return true
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
}

// --- group

const onAddGroup = async (t) => {
  const obj = {
    action: 'add',
    id: 0,
    code: '',
    title: '',
  }

  const modalStore = useModalStore()

  modalStore.setTitle(t('groups.modal.add'))
  modalStore.setSize('md')
  modalStore.setData(obj)

  const result = await modalStore.open(
    defineAsyncComponent({
      loader: () => import('@/components/modals/group.vue'),
      // loadingComponent: LoadingProcess,
      // delay: timeoutLoad, // default: 200ms
      // errorComponent: LoadingError,
      // timeout: timeoutError // default: infinity
    }),
    [
      // actions
    ]
  )

  return result?.saved ?? false
}

const onEditGroup = async (t, obj) => {
  const modalStore = useModalStore()

  modalStore.setTitle(t('groups.modal.edit'))
  modalStore.setSize('md')
  modalStore.setData(obj)

  const result = await modalStore.open(
    defineAsyncComponent({
      loader: () => import('@/components/modals/group.vue'),
      // loadingComponent: LoadingProcess,
      // delay: timeoutLoad, // default: 200ms
      // errorComponent: LoadingError,
      // timeout: timeoutError // default: infinity
    }),
    [
      // actions
    ]
  )

  return result?.saved ?? false
}

const onDeleteGroup = async (t, obj, $toast) => {
  const { show: dialogShow } = useBsConfirmation()

  const ok = await dialogShow({
    title: t('groups.modal.delete'),
    message: t('groups.modal.deletemsg'),
    okButton: t('btn.delete'),
    cancelButton: t('btn.cancel'),
  })

  if (!ok) {
    console.log('Not confirmed...')
    return false
  }

  const url = `${URL_PATH}/groups/${obj.id}`

  try {
    const options = {
      method: 'DELETE',
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

    return true
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
}

// -- entry

const onAddEntry = async (t) => {
  const obj = {
    // форма
    group: '',
    key: '',
    value: '',
    // справочники
    groups: [],
  }

  // получить справочники
  obj.groups = await getGroups(t);

  const modalStore = useModalStore()

  modalStore.setTitle(t('entries.modal.add'))
  modalStore.setSize('md')
  modalStore.setData(obj)

  const result = await modalStore.open(
    defineAsyncComponent({
      loader: () => import('@/components/modals/entry-add.vue'),
      // loadingComponent: LoadingProcess,
      // delay: timeoutLoad, // default: 200ms
      // errorComponent: LoadingError,
      // timeout: timeoutError // default: infinity
    }),
    [
      // actions
    ]
  )

  return result?.saved ?? false
}

const onEditValue = async (t, obj) => {
  // получить справочники
  obj.languages = await getLanguages(t);
  obj.groups = await getGroups(t);

  const modalStore = useModalStore()

  modalStore.setTitle(t('entries.modal.edit'))
  modalStore.setSize('md')
  modalStore.setData(obj)

  const result = await modalStore.open(
    defineAsyncComponent({
      loader: () => import('@/components/modals/entry-value.vue'),
      // loadingComponent: LoadingProcess,
      // delay: timeoutLoad, // default: 200ms
      // errorComponent: LoadingError,
      // timeout: timeoutError // default: infinity
    }),
    [
      // actions
    ]
  )

  return result?.saved ?? false
}

// удалить значение (записать null)
const onDeleteValue = async (t, obj, $toast) => {
  const { key_id, language_id, language_group_id } = obj
  const { show: dialogShow } = useBsConfirmation()

  const ok = await dialogShow({
    title: t('entries.modal.delete'),
    message: t('entries.modal.delete_value'),
    okButton: t('btn.delete'),
    cancelButton: t('btn.cancel'),
  })

  if (!ok) {
    console.log('Not confirmed...')
    return false
  }

  const url = `${URL_PATH}/entries/group/${language_group_id}/key/${key_id}/language/${language_id}`

  try {
    const options = {
      method: 'DELETE',
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

    return true
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
}

const onEditKey = async (t, obj) => {
  // получить справочники
  obj.languages = await getLanguages(t);
  obj.groups = await getGroups(t);

  const modalStore = useModalStore()

  modalStore.setTitle(t('entries.modal.edit'))
  modalStore.setSize('md')
  modalStore.setData(obj)

  const result = await modalStore.open(
    defineAsyncComponent({
      loader: () => import('@/components/modals/entry-key.vue'),
      // loadingComponent: LoadingProcess,
      // delay: timeoutLoad, // default: 200ms
      // errorComponent: LoadingError,
      // timeout: timeoutError // default: infinity
    }),
    [
      // actions
    ]
  )

  return result?.saved ?? false
}

// удалить ключ
const onDeleteKey = async (t, obj, $toast) => {
  const { key_id, language_group_id } = obj
  const { show: dialogShow } = useBsConfirmation()

  const ok = await dialogShow({
    title: t('entries.modal.delete'),
    message: t('entries.modal.delete_key'),
    okButton: t('btn.delete'),
    cancelButton: t('btn.cancel'),
  })

  if (!ok) {
    console.log('Not confirmed...')
    return false
  }

  const url = `${URL_PATH}/entries/group/${language_group_id}/key/${key_id}`

  try {
    const options = {
      method: 'DELETE',
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

    return true
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
}

export {
  // language
  onAddLang, onEditLang, onDeleteLang,
  // group
  onAddGroup, onEditGroup, onDeleteGroup,
  // entry
  onAddEntry, onEditValue, onDeleteValue, onEditKey, onDeleteKey,
}
