<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue'

import { emitter } from '@/utils/emitter'

import { useRouter, useRoute } from 'vue-router'
const route = useRoute()
const router = useRouter()

import { URL_PATH } from '@/constants/settings'
const path = 'groups'
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
const onpage = ref(15) // сколько на странице

// колонки
const columns = computed(() => [
  {
    title: t('group.cols.code'),
    field: 'code',
    width: '30%',
    sorter: 'string',
    editor: 'input',
    validator: ['required', 'string', 'maxLength:255'],
  },
  {
    title: t('group.cols.title'),
    field: 'title',
    sorter: 'string',
    editor: 'input',
    validator: ['alphanumeric', 'maxLength:255'],
  },
  {
    title: t('group.cols.actions'),
    field: 'id',
    width: 120,
    formatter: actionFormatter,
    formatterParams: {
      t,
      page: 'group',
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
        tr: 'group',
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

    if (route.query.action === 'group:create') {
      tabulatorAddRow(tabulator, isAdding)
      router.replace({ query: {} })
    }
  })

  // добавить группу
  emitter.on('tabulator:group:add-row', () => {
    if (route.query.action === 'group:create') {
      // не надо
    } else {
      tabulatorAddRow(tabulator, isAdding)
      router.replace({ query: {} })
    }
  })

  // отмена добавления
  emitter.on('tabulator:group:cancel-add', () => {
    isAdding.value = false
  })
})

onBeforeUnmount(() => {
  emitter.off('tabulator:group:add-row')
})

onUnmounted(() => {
  if (tabulator) {
    tabulator.destroy()
  }
})
</script>

<template>
  <div class="tab-content page-groups container-fluid">
    <h1 class="pt-3">{{ t('group.title') }}</h1>
    <div class="pt-3 pb-2 d-none">
      <button class="btn btn-success btn-sm" @click="tabulatorAddRow(tabulator, isAdding)">
        <font-awesome-icon icon="fa-square-plus row" /> {{ t('actions.addgroup') }}
      </button>
    </div>

    <div class="container-lg ms-0">
      <div ref="table"></div>
    </div>
  </div>
</template>
