<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue'

import { emitter } from '@/utils/emitter'

import { useRouter, useRoute } from 'vue-router'
const route = useRoute()
const router = useRouter()

import { URL_PATH } from '@/constants/settings'
const url = ref(`${URL_PATH}/languages`)

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

import { TabulatorFull as Tabulator } from 'tabulator-tables'
const table = ref(null)
let tabulator = null

import { createTabulatorLang, updateTabulatorLanguage } from '@/composable/tabulator-i18n'
import { actionFormatter } from '@/composable/tabulator-buttons'
import { tabulatorAddRow, saveToBackend } from '@/composable/tabulator-methods'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// кнопки в таблице
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons'
library.add(faSquarePlus)
// faTrash, faXmark,

const isAdding = ref(false)
const onpage = ref(10) // сколько на странице

// колонки
const columns = computed(() => [
  {
    title: t('language.cols.code'),
    field: 'code',
    width: 75,
    sorter: 'string',
    editor: 'input',
    validator: ['required', 'string', 'minLength:1', 'maxLength:2'],
  },
  {
    title: t('language.cols.title'),
    field: 'title',
    sorter: 'string',
    editor: 'input',
    validator: ['alphanumeric', 'maxLength:20'],
  },
  {
    title: t('language.cols.actions'),
    field: 'id',
    width: 120,
    formatter: actionFormatter,
    formatterParams: {
      t,
    },
    headerSort: false,
  },
])

// ---

// запуск tabulator
const initTabulator = () => {
  if (tabulator) {
    tabulator.destroy()
  }

  // языки для tabulator из vue-i18n
  const initialLang = {
    [locale.value]: createTabulatorLang(t),
  }

  return new Promise((resolve) => {
    let isResolved = false

    tabulator = new Tabulator(table.value, {
      ajaxURL: url.value,
      reactiveData: true,
      layout: 'fitColumns',
      sortMode: 'remote',
      initialSort: [{ column: 'title', dir: 'asc' }],
      pagination: true,
      paginationMode: 'remote',
      paginationSize: onpage.value, // сколько на странице
      columns: columns.value,
      locale: locale.value,
      langs: initialLang,
      rowFormatter: function (row) {
        if (row.getData()._isNew) {
          row.getElement().classList.add('bg-warning')
        } else {
          row.getElement().classList.remove('bg-warning')
        }
      },
    })

    // данные загружены
    tabulator.on('dataLoaded', function (data) {
      if (!isResolved) {
        isResolved = true
        resolve()
      }
    })

    // ошибка загрузки данных
    tabulator.on('dataLoadError', function (error) {
      if (!isResolved) {
        isResolved = true
        reject(error)
      }
    })

    // ячейка отредактирована
    tabulator.on('cellEdited', (cell) => {
      let row = cell.getRow()
      let rowData = cell.getRow().getData()
      let rowId = rowData.id

      let code = undefined
      let title = undefined
      const errors = []

      if (rowData._isNew) {
        // новая строка
        switch (cell.getField()) {
          case 'code':
            code = cell.getValue().trim()
            if (!code) {
              errors.push(t('language.form.error.nocode'))
            }
            break
          case 'title':
            title = cell.getValue().trim()
            if (!title) {
              errors.push(t('language.form.error.notitle'))
            }
            break
        }
      } else {
        // обновление строки
        code = rowData?.code?.trim()
        title = rowData?.title?.trim()

        if (!code) {
          errors.push(t('language.form.error.nocode'))
        }
        if (!title) {
          errors.push(t('language.form.error.notitle'))
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
          saveToBackend(cell, saveData, url.value, 'POST')
            .then((data) => {
              row
                .update({
                  id: data.id, // новый id
                  _isNew: false,
                })
                .then(() => {
                  row.reformat()
                })

              $toast.success(t('language.toast.created'), TOAST_OPTIONS)
              isAdding.value = false
            })
            .catch((error) => {
              // показать ошибки?
              console.error('Save failed:', error)

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
      saveToBackend(cell, saveData, `${url.value}/${rowId}`, 'PATCH')
        .then((data) => {
          // показать ответ?
          console.log('Save successful:', data)
          $toast.success(t('language.toast.edited'), TOAST_OPTIONS)
        })
        .catch((error) => {
          // показать ошибки?
          console.error('Save failed:', error)
          // восстановить старое значение
          cell.restoreOldValue()
        })
    })
  })
}

// ---

// смена локали в vue-i18n
watch(locale, async (newLocale) => {
  updateTabulatorLanguage(tabulator, t, newLocale)
  tabulator.setColumns(columns.value)
})

// ---

onMounted(() => {
  initTabulator().then(async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (route.query.action === 'language:create') {
      tabulatorAddRow(tabulator, isAdding)
      router.replace({ query: {} })
    }
  })

  emitter.on('tabulator:language:add-row', () => {
    if (route.query.action === 'language:create') {
      // не надо
    } else {
      tabulatorAddRow(tabulator, isAdding)
      router.replace({ query: {} })
    }
  })

  emitter.on('tabulator:reset-add', () => {
    isAdding.value = false
  })
})

onBeforeUnmount(() => {
  emitter.off('tabulator:language:add-row')
})

onUnmounted(() => {
  if (tabulator) {
    tabulator.destroy()
  }
})
</script>

<template>
  <div class="tab-content page-langs container-fluid">
    <h1 class="pt-3">{{ t('language.title') }}</h1>
    <div class="pt-3 pb-2 d-none">
      <button class="btn btn-success btn-sm" @click="tabulatorAddRow(tabulator, isAdding)">
        <font-awesome-icon icon="fa-square-plus row" /> {{ t('actions.addlanguage') }}
      </button>
    </div>

    <div class="container-lg ms-0">
      <div ref="table"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tab-content {
  &.page-langs {
    padding-bottom: calc(var(--bs-gutter-x) * 0.5);
  }
}
</style>
