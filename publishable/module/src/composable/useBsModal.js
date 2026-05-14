import { defineAsyncComponent } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useBsConfirmation } from '@/composable/useBsConfirmation.js'
import { URL_PATH } from '@/constants/settings'
import { getGroups } from '@/composable/useApiMethods'

import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

// --- language
// empty

// --- group
// empty

// -- entry

// модалка добавления строки
export const onAddEntry = async (group_id, t) => {
  const obj = {
    // форма
    group_id,
    key: '',
    value: '',
    // справочники
    groups: [],
  }

  // получить справочники
  obj.groups = await getGroups(t);

  const modalStore = useModalStore()

  modalStore.setTitle(t('entry.modal.add'))
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

  return result
}

// модалка редактирования ключа
export const onEditKey = async (group_id, value, t) => {
  const obj = {
    group_id,
    key: value,
    keyOld: value,
    // справочники
    groups: [],
  }

  // получить справочники
  obj.groups = await getGroups(t);

  const modalStore = useModalStore()

  modalStore.setTitle(t('entry.modal.edit_key'))
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

  return result
}

// удалить ключ
export const onDeleteKey = async (group_id, value, t) => {
  const obj = {
    group_id,
    key: value,
  }

  const { show: dialogShow } = useBsConfirmation()

  const ok = await dialogShow({
    title: t('entry.modal.delete'),
    message: t('entry.modal.delete_key'),
    okButton: t('btn.delete'),
    cancelButton: t('btn.cancel'),
  })

  if (!ok) {
    console.log('Not confirmed...')
    return { deleted: false, }
  }

  const url = `${URL_PATH}/entries/group/${group_id}/key`

  try {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify(obj),
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

    return { deleted: true, group_id }
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
