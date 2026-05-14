<script setup>
import {
  ref,
  reactive,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  nextTick,
} from 'vue'

import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

import { emitter } from '@/utils/emitter'

import { useRouter, useRoute } from 'vue-router'
const route = useRoute()
const router = useRouter()

import { getGroupsList } from '@/composable/useApiMethods'

import { URL_PATH } from '@/constants/settings'
const path = 'entries'
const url = ref(`${URL_PATH}/${path}`)

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

import { onAddEntry } from '@/composable/useBsModal'

import { TabulatorFull as Tabulator } from 'tabulator-tables'
const table = ref(null)
let tabulator = null

import { createTabulatorI18n, updateTabulatorI18n } from '@/composable/tabulator-i18n'
import {
  tabulatorRowFormatter,
  tabulatorGroupHeaderFormatter,
  tabulatorEventCellEditing,
  tabulatorEventCellEditCancelled,
  tabulatorEventCellEditedEntry,
} from '@/composable/tabulator-methods'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// кнопки в таблице
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons'
library.add(faSquarePlus)

const filters = reactive({
  group_id: 0,
  perPage: 0,
  page: 1,
})

const formGroups = ref([])
const formOnpage = ref([])

// колонки
const columnsGroups = computed(() => [
  {
    field: 'id',
    visible: false,
  },
  {
    field: 'language_id',
    visible: false,
  },
  {
    field: 'language_group_id',
    visible: false,
  },
  {
    field: 'key',
    visible: false,
  },
  {
    title: t('entry.cols.language'),
    field: 'language.code',
    width: 85,
    headerSort: false,
  },
  {
    title: t('entry.cols.value'),
    field: 'value',
    editor: 'textarea',
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
      ajaxParams: filters,
      reactiveData: true,
      layout: 'fitColumns',
      sortMode: 'remote',
      groupBy: ['key'],
      groupHeader: (value, count, data, group) => {
        return tabulatorGroupHeaderFormatter(value, count, data, group, {
          group_id: filters.group_id,
          t,
          tabulator,
        })
      },
      pagination: true,
      paginationMode: 'remote',
      paginationSize: filters.perPage,
      columns: columnsGroups.value,
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
  })
}

// --- watch:

// смена локали в vue-i18n
watch(locale, (newLocale) => {
  updateTabulatorI18n(tabulator, t, newLocale)
  tabulator.setColumns(columnsGroups.value)
})

// смена фильтра
watch(filters, () => loadData(), { deep: true })

// --- methods:

const loadData = () => {
  if (tabulator) {
    if (filters.group_id != 0) {
      // update
      tabulator.setData()
    } else {
      tabulator.clearData()
    }
  }
}

async function preloadForm() {
  formOnpage.value = [25, 50, 100, 250]
  filters.perPage = formOnpage.value[1]

  formGroups.value = await getGroupsList()
  filters.group_id = formGroups.value[0].id
}

const addRowModal = async () => {
  const res = await onAddEntry(filters.group_id, t)
  // res.saved
  // res.group_id

  if (res.saved) {
    $toast.success(t('entry.toast.created'), TOAST_OPTIONS)

    filters.group_id = res.group_id
    // update
    tabulator.setData()
  }
}

// --- хуки:

onMounted(async () => {
  await preloadForm()
  await initTabulator()

  // делается сортировка
  tabulator.on('dataSorting', (sorters) => {
    //
  })

  // ячейка редактируется
  tabulator.on('cellEditing', tabulatorEventCellEditing)

  // отмена редактирования
  tabulator.on('cellEditCancelled', tabulatorEventCellEditCancelled)

  // ячейка отредактирована
  tabulator.on('cellEdited', (cell) =>
    tabulatorEventCellEditedEntry(cell, {
      t,
      tr: 'entry',
      url: url.value,
    }),
  )

  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (route.query.action === 'entry:create') {
    addRowModal()
    router.replace({ query: {} })
  }

  // добавить строку
  emitter.on('tabulator:entry:add-row', () => {
    if (route.query.action === 'entry:create') {
      // не надо
    } else {
      addRowModal()
      router.replace({ query: {} })
    }
  })

  // отмена добавления
  emitter.on('tabulator:entry:cancel-add', () => {
    //
  })
})

onBeforeUnmount(() => {
  emitter.off('tabulator:entry:add-row')
})

onUnmounted(() => {
  if (tabulator) {
    tabulator.destroy()
  }
})
</script>

<template>
  <div class="tab-content page-entries container-fluid">
    <h1 class="pt-3">{{ t('entry.title') }}</h1>
    <div class="pt-3 pb-2 d-none">
      <button class="btn btn-success btn-sm" @click="addRowModal()">
        <font-awesome-icon icon="fa-square-plus row" /> {{ t('actions.addentry') }}
      </button>
    </div>

    <div class="container ms-0 mb-3">
      <form class="row row-cols-lg-auto g-3 align-items-center">
        <div class="col-12">
          <button
            class="btn btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{
              filters.group_id == 0
                ? t('entry.form.search.select_group')
                : formGroups.find((item) => item.id === filters.group_id).title
            }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <a
                class="dropdown-item"
                href="#"
                v-for="group in formGroups"
                :key="group.id"
                @click.prevent="filters.group_id = group.id"
              >
                {{ group.title }} <small class="text-muted">({{ group.code }})</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="col-12">
          <label class="visually-hidden" for="inlinePerPage">{{
            t('entry.form.search.label_rows')
          }}</label>
          <select v-model="filters.perPage" id="inlinePerPage" class="form-select">
            <option v-for="el in formOnpage" :key="el" :value="el">{{ el }}</option>
          </select>
        </div>

        <button @click="loadData" class="btn btn-primary">
          {{ t('entry.form.search.button_refresh') }}
        </button>
      </form>
    </div>

    <div class="container-lg ms-0">
      <div ref="table"></div>
    </div>
  </div>
</template>
