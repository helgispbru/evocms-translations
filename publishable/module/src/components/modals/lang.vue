<script setup>
import { ref, computed, inject } from 'vue'
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

const codeField = ref(null)
const titleField = ref(null)

const isCodeValid = computed(() => {
  return codeField.value?.meta?.valid || false
})
const isTitleValid = computed(() => {
  return titleField.value?.meta?.valid || false
})

async function submitModalForm(values) {
  error.value = ''
  message.value = ''

  if (modalStore.data.action == 'edit' && Number(modalStore.data.id) == 0) {
    error.value = t('languages.form.error.noid')
    $toast.warning(error.value, TOAST_OPTIONS)
    return false
  }

  const form = Object.assign({}, modalStore.data, values, { locale: locale.value })

  let method = ''
  let url = ''
  switch (form.action) {
    case 'add':
      method = 'POST'
      url = `${URL_PATH}/languages`
      break
    case 'edit':
      method = 'PUT'
      url = `${URL_PATH}/languages/${form.id}`
      break
    default:
      error.value = t('languages.form.error.noaction')
      $toast.error(error.value, TOAST_OPTIONS)
      return false
  }

  try {
    const options = {
      method: method,
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

      if (errors.hasOwnProperty('code')) {
        codeField.value.setErrors(errors.code)
      }
      if (errors.hasOwnProperty('title')) {
        titleField.value.setErrors(errors.title)
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
</script>

<template>
  <Form
    @submit="submitModalForm"
    @reset="resetModalForm"
    class="needs-validation"
    name="LanguageForm"
    :initial-values="{ code: modalStore.data.code, title: modalStore.data.title }"
  >
    <!-- код -->
    <div class="row mb-1 align-items-center">
      <label
        class="col-4 col-form-label"
        :class="{ 'pb-4': !isCodeValid }"
        for="validationLanguageCode"
        >{{ t('languages.form.code') }}</label
      >
      <div class="col-8">
        <Field
          name="code"
          ref="codeField"
          rules="required|max:2"
          class="form-control"
          :class="{ 'is-invalid': !isCodeValid }"
          type="text"
          autocomplete="off"
          id="validationLanguageCode"
          aria-describedby="validationLanguageCodeFeedback"
        />
        <ErrorMessage
          name="code"
          as="div"
          class="invalid-feedback"
          id="validationLanguageCodeFeedback"
        />
      </div>
    </div>

    <!-- название -->
    <div class="row mb-1 align-items-center">
      <label
        class="col-4 col-form-label"
        :class="{ 'pb-4': !isTitleValid }"
        for="validationLanguageTitle"
        >{{ t('languages.form.title') }}</label
      >
      <div class="col-8">
        <Field
          name="title"
          ref="titleField"
          rules="required|max:20"
          class="form-control"
          :class="{ 'is-invalid': !isTitleValid }"
          type="text"
          autocomplete="off"
          id="validationLanguageTitle"
          aria-describedby="validationLanguageTitleFeedback"
        />
        <ErrorMessage
          name="title"
          as="div"
          class="invalid-feedback"
          id="validationLanguageTitleFeedback"
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
