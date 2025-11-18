<script setup>
import { ref, reactive, watch, computed } from 'vue'

import { URL_PATH } from '@/constants/settings'

import { useLangsStore } from '@/stores/langs'
const langsStore = useLangsStore()

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

import DataTable from 'datatables.net-vue3'
// import DataTablesCore from 'datatables.net-dt' // выводить как dtatables
import DataTablesCore from 'datatables.net-bs5' // выводить как bootstrap5
import 'datatables.net-responsive'
DataTable.use(DataTablesCore)
const dataTable = ref(null)

import { onEditLang, onDeleteLang } from '@/composable/useBsModal'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// кнопки в таблице
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
library.add(faPenToSquare, faTrash)

// языки (1) - для datatables
import enGB from 'datatables.net-plugins/i18n/en-GB'
import ru from 'datatables.net-plugins/i18n/ru'
// языки (2) - соответствие выбранной локали и загруженного языка
const dtLangMap = reactive({
  en: enGB,
  ru: ru,
  // add other mappings as needed
})
const dtLang = reactive({})
dtLang.value = dtLangMap[locale.value] || enGB

// колонки таблицы
const columns = computed(() => [
  { data: 'code', title: t('languages.cols.code'), orderable: true },
  { data: 'title', title: t('languages.cols.title'), orderable: true },
])

// опции таблицы
const options = reactive({
  ajax: {
    url: `${URL_PATH}/languages`,
  },
  serverSide: true,
  // paging: false, // p
  // searching: false, // f
  // ordering: false,
  language: dtLang.value,
  responsive: true,
  // dom: '<"top"fpl>t<"bottom"ip>', //<"search"f>
  dom: '<"top"lf>t<"bottom"ip>', // <"search"f>
  stateSave: true,
})

// смена локали в vue-i18n
watch(locale, async (newLocale) => {
  dtLang.value = dtLangMap[newLocale] || enGB
  options.language = dtLang.value

  // при смене локали перегрузить полностью
  langsStore.increaseTableKey()
})

async function rowEdit(obj) {
  if (await onEditLang(t, obj)) {
    $toast.success(t('languages.toast.edited'), TOAST_OPTIONS)

    if (dataTable.value.dt && dataTable.value.dt.ajax.reload) {
      dataTable.value.dt.ajax.reload(null, false)
    }
  }
}

async function rowDelete(obj) {
  if (await onDeleteLang(t, obj, $toast)) {
    $toast.success(t('languages.toast.deleted'), TOAST_OPTIONS)

    if (dataTable.value.dt && dataTable.value.dt.ajax.reload) {
      dataTable.value.dt.ajax.reload(null, false)
    }
  }
}
</script>

<template>
  <div class="tab-content page-langs container-fluid">
    <h1 class="pt-3">{{ t('languages.title') }}</h1>
    <DataTable
      ref="dataTable"
      :key="langsStore.tableKey"
      :columns="columns"
      :options="options"
      class="table"
    >
      <template #column-1="props">
        <div class="d-flex align-items-center">
          <span class="flex-grow-1">{{ props.cellData }}</span>
          <span class="d-flex">
            <button
              @click="rowEdit(Object.assign({ action: 'edit' }, props.rowData))"
              type="button"
              class="btn btn-link text-secondary py-0"
              :title="t('btn.edit')"
            >
              <font-awesome-icon icon="pen-to-square" />
            </button>
            <button
              @click="rowDelete({ id: props.rowData.id })"
              type="button"
              class="btn btn-link text-secondary py-0"
              :title="t('btn.delete')"
            >
              <font-awesome-icon icon="trash" />
            </button>
          </span>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
.tab-content {
  &.page-langs {
    padding-bottom: calc(var(--bs-gutter-x) * 0.5);
  }
}
</style>
