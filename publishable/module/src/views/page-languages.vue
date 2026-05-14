<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue'

import { emitter } from '@/utils/emitter'

import { useRouter, useRoute } from 'vue-router'
const route = useRoute()
const router = useRouter()

import { URL_PATH } from '@/constants/settings'
const path = 'languages'
const url = ref(`${URL_PATH}/${path}`)

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

import { TabulatorFull as Tabulator } from 'tabulator-tables'
const table = ref(null)
let tabulator = null

import { createTabulatorI18n, updateTabulatorI18n } from '@/composable/tabulator-i18n'
import { actionFormatter } from '@/composable/tabulator-buttons'
import {
  tabulatorAddRow,
  tabulatorRowFormatter,
  tabulatorEventCellEditing,
  tabulatorEventCellEditCancelled,
  tabulatorEventCellEdited,
} from '@/composable/tabulator-methods'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// кнопки в таблице
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons'
library.add(faSquarePlus)

const isAdding = ref(false)
const onpage = ref(10) // сколько на странице

// колонки
const columns = computed(() => [
  {
    title: t('language.cols.code'),
    field: 'code',
    width: 85,
    sorter: 'string',
    editor: 'input',
    validator: ['required', 'alphanumeric', 'minLength:1', 'maxLength:2'],
  },
  {
    title: t('language.cols.title'),
    field: 'title',
    sorter: 'string',
    editor: 'input',
    validator: ['string', 'maxLength:20'],
  },
  {
    title: t('language.cols.actions'),
    field: 'id',
    width: 120,
    formatter: actionFormatter,
    formatterParams: {
      t,
      page: 'language',
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
    [locale.value]: createTabulatorI18n(t),
  }

  return new Promise((resolve, reject) => {
    let isResolved = false

    tabulator = new Tabulator(table.value, {
      ajaxURL: url.value,
      reactiveData: true,
      layout: 'fitColumns',
      sortMode: 'remote',
      initialSort: [{ column: 'code', dir: 'asc' }],
      pagination: true,
      paginationMode: 'remote',
      paginationSize: onpage.value,
      columns: columns.value,
      locale: locale.value,
      langs: initialLang,
      rowFormatter: tabulatorRowFormatter,
    })

    // данные загружены
    tabulator.on('dataLoaded', function (data) {
      if (!isResolved) {
        isResolved = true
        resolve(data)
      }
    })

    // ошибка загрузки данных
    tabulator.on('dataLoadError', function (error) {
      if (!isResolved) {
        isResolved = true
        reject(error)
      }
    })

    // делается сортировка
    tabulator.on('dataSorting', (sorters) => {
      isAdding.value = false
    })

    // ячейка редактируется
    tabulator.on('cellEditing', tabulatorEventCellEditing)

    // отмена редактирования
    tabulator.on('cellEditCancelled', tabulatorEventCellEditCancelled)

    // ячейка отредактирована
    tabulator.on('cellEdited', (cell) =>
      tabulatorEventCellEdited(cell, {
        t,
        tr: 'language',
        url: url.value,
        isAdding,
      }),
    )
  })
}

// ---

// смена локали в vue-i18n
watch(locale, async (newLocale) => {
  updateTabulatorI18n(tabulator, t, newLocale)
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

  // добавить язык
  emitter.on('tabulator:language:add-row', () => {
    if (route.query.action === 'language:create') {
      // не надо
    } else {
      tabulatorAddRow(tabulator, isAdding)
      router.replace({ query: {} })
    }
  })

  // отмена добавления
  emitter.on('tabulator:language:cancel-add', () => {
    isAdding.value = false
  })

  emitter.on('tabulator:reload', () => {
    // update
    tabulator.setData()
  })
})

onBeforeUnmount(() => {
  emitter.off('tabulator:language:add-row')
  emitter.off('tabulator:language:cancel-add')
  emitter.off('tabulator:reload')
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
