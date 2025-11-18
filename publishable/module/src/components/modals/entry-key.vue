<script setup>
import { ref, computed, inject, toRaw } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'

import { URL_PATH } from '@/constants/settings'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const locale = inject('locale')

import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

const model = defineModel()

import { useModalStore } from '@/stores/modal'
const modalStore = useModalStore()

const message = ref('')
const error = ref('')

const keyField = ref(null)

const isKeyValid = computed(() => {
  return keyField.value?.meta?.valid || false
})

async function submitModalForm(values) {
  error.value = ''
  message.value = ''

  const form = Object.assign({}, modalStore.data, values, { locale: locale.value })

  delete form.groups
  delete form.languages

  const url = `${URL_PATH}/entries/group/${form.language_group_id}/key/${form.key_id}`

  try {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify(form),
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

      // сообщения под полями
      if (errors.hasOwnProperty('key')) {
        keyField.value.setErrors(errors.key)
      }

      // HTTP errors (404, 500, etc.)
      const error = new Error(errorText)
      error.status = response.status
      // $toast.error(`HTTP error! status: ${response.status}`, TOAST_OPTIONS)
      throw error
    }

    message.value = data.message || ''
    error.value = data.error || ''

    model.value.data = { saved: true }
    model.value.action = 'close'
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

function resetModalForm() {
  error.value = ''
  message.value = ''

  model.value.data = { saved: false }
  model.value.action = 'close'
}

const group_title = computed(() => {
  const foundItem = Object.values(toRaw(modalStore.data.groups)).find(
    (el) => el.id === parseInt(modalStore.data.language_group_id),
  )
  if (foundItem) {
    return foundItem.title
  }
  return 'n/a'
})
</script>

<template>
  <Form
    @submit="submitModalForm"
    @reset="resetModalForm"
    class="needs-validation"
    name="EntryKeyForm"
    :initial-values="{
      key: modalStore.data.key,
    }"
  >
    <!-- группа -->
    <div class="row mb-1 align-items-center">
      <div class="col-4">{{ t('entries.form.group') }}</div>
      <div class="col-8 py-2 ps-4">
        <strong>{{ group_title }}</strong>
      </div>
    </div>

    <!-- ключ -->
    <div class="row mb-1 align-items-center">
      <label
        class="col-4 col-form-label"
        :class="{ 'pb-4': !isKeyValid }"
        for="validationEntryKey"
        >{{ t('entries.form.key') }}</label
      >
      <div class="col-8">
        <Field
          name="key"
          ref="keyField"
          rules="max:255"
          class="form-control"
          :class="{ 'is-invalid': !isKeyValid }"
          type="text"
          autocomplete="off"
          id="validationEntryKey"
          aria-describedby="validationEntryKeyFeedback"
        />
        <ErrorMessage
          name="key"
          as="div"
          class="invalid-feedback"
          id="validationEntryKeyFeedback"
        />
      </div>
    </div>

    <div v-if="message.length" class="alert alert-success px-2 py-1" role="alert">
      {{ message }}
    </div>
    <div v-if="error.length" class="alert alert-warning px-2 py-1" role="alert">{{ error }}</div>

    <div class="mt-3 text-end">
      <button class="btn btn-primary mx-1" type="submit">{{ t('btn.save') }}</button>
      <button class="btn btn-secondary mx-1" type="reset">{{ t('btn.cancel') }}</button>
    </div>
  </Form>
</template>
