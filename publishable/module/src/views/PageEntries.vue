<script setup>
import { ref, reactive, watch, computed } from 'vue'

import { URL_PATH } from '@/constants/settings'

import { useEntriesStore } from '@/stores/entries'
const entriesStore = useEntriesStore()

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

import { useToast } from 'vue-toast-notification'
import { TOAST_OPTIONS } from '@/constants/toasts'
const $toast = useToast()

import DataTable from 'datatables.net-vue3'
// import DataTablesCore from 'datatables.net-dt' // выводить как dtatables
import DataTablesCore from 'datatables.net-bs5' // выводить как bootstrap5
import 'datatables.net-columncontrol-dt' // ColumnControls
import 'datatables.net-responsive' // Responsive
DataTable.use(DataTablesCore)
const dataTable = ref(null)

import { onEditKey, onEditValue, onDeleteValue, onDeleteKey } from '@/composable/useBsModal'

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
  { data: 'group', title: t('entries.cols.group') }, //, orderable: true
  { data: 'key', title: t('entries.cols.key') }, // , orderable: true
  { data: 'rows', title: t('entries.cols.value') }, //, orderable: false
])

// опции таблицы
const options = reactive({
  ajax: {
    url: `${URL_PATH}/entries`,
  },
  serverSide: true,
  // paging: false, // p
  // searching: false, // f
  // ordering: false,
  language: dtLang.value,
  responsive: true,
  // order: [[2, 'asc']],
  // dom: '<"top"fpl>t<"bottom"ip>', //<"search"f>
  dom: '<"top"l>t<"bottom"ip>', // <"search"f>
  columnControl: ['order', 'searchDropdown'],
  columnDefs: [
    {
      target: [-1],
      columnControl: [],
    },
  ],
  // stateSave: true,
})

// смена локали в vue-i18n
watch(locale, async (newLocale) => {
  dtLang.value = dtLangMap[newLocale] || enGB
  options.language = dtLang.value

  // при смене локали перегрузить полностью
  entriesStore.increaseTableKey()
})

// редактировать ключ
const rowKeyEdit = async (obj) => {
  if (await onEditKey(t, obj)) {
    $toast.success(t('entries.toast.edited'), TOAST_OPTIONS)

    if (dataTable.value.dt && dataTable.value.dt.ajax.reload) {
      dataTable.value.dt.ajax.reload(null, false)
    }
  }
}

// удалить все строки в группе по ключу
const rowKeyDelete = async (obj) => {
  if (await onDeleteKey(t, obj, $toast)) {
    $toast.success(t('entries.toast.deleted'), TOAST_OPTIONS)

    if (dataTable.value.dt && dataTable.value.dt.ajax.reload) {
      dataTable.value.dt.ajax.reload(null, false)
    }
  }
}

// редактировать строку
const rowValueEdit = async (obj) => {
  if (await onEditValue(t, obj)) {
    $toast.success(t('entries.toast.edited'), TOAST_OPTIONS)

    if (dataTable.value.dt && dataTable.value.dt.ajax.reload) {
      dataTable.value.dt.ajax.reload(null, false)
    }
  }
}

// удалить строку (записать null)
const rowValueDelete = async (obj) => {
  if (await onDeleteValue(t, obj, $toast)) {
    $toast.success(t('entries.toast.deleted'), TOAST_OPTIONS)

    if (dataTable.value.dt && dataTable.value.dt.ajax.reload) {
      dataTable.value.dt.ajax.reload(null, false)
    }
  }
}
</script>

<template>
  <div class="tab-content page-entries container-fluid">
    <h1 class="pt-3">{{ t('entries.title') }}</h1>

    <DataTable
      ref="dataTable"
      :key="entriesStore.tableKey"
      :columns="columns"
      :options="options"
      class="table"
    >
      <template #column-1="props">
        <div class="d-flex align-items-center">
          <span class="flex-grow-1">{{ props.cellData }}</span>
          <span class="d-flex">
            <button
              @click="
                rowKeyEdit({
                  key_id: props.rowData.id,
                  language_group_id: parseInt(props.rowData.language_group_id),
                  key: props.rowData.key,
                })
              "
              type="button"
              class="btn btn-link text-secondary py-0"
              :title="t('btn.edit')"
            >
              <font-awesome-icon icon="pen-to-square" />
            </button>
            <button
              @click="
                rowKeyDelete({
                  key_id: props.rowData.id,
                  language_group_id: parseInt(props.rowData.language_group_id),
                })
              "
              type="button"
              class="btn btn-link text-secondary py-0"
              :title="t('btn.delete')"
            >
              <font-awesome-icon icon="trash" /></button
          ></span>
        </div>
      </template>
      <template #column-2="props">
        <table class="table table-sm mb-0">
          <tbody>
            <tr v-for="el in props.cellData" :key="el.id">
              <td class="bg-secondary bg-opacity-10 align-middle text-end pe-2 langtitle">
                <small>{{ el.language.title }}</small>
              </td>
              <td
                class="d-flex align-items-center"
                :class="{
                  'bg-danger bg-opacity-10': el.value === null,
                  'bg-warning bg-opacity-10': el.value !== null && el.value.length == 0,
                }"
              >
                <span class="flex-grow-1">{{ el.value }}</span>
                <span class="d-flex">
                  <button
                    @click="
                      rowValueEdit({
                        key_id: el.id,
                        language_id: parseInt(el.language_id),
                        language_group_id: parseInt(el.language_group_id),
                        key: el.key,
                        value: el.value,
                      })
                    "
                    type="button"
                    class="btn btn-link text-secondary py-0"
                    :title="t('btn.edit')"
                  >
                    <font-awesome-icon icon="pen-to-square" />
                  </button>
                  <button
                    @click="
                      rowValueDelete({
                        key_id: el.id,
                        language_id: parseInt(el.language_id),
                        language_group_id: parseInt(el.language_group_id),
                      })
                    "
                    type="button"
                    class="btn btn-link text-secondary py-0"
                    :title="t('btn.delete')"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
.tab-content {
  &.page-entries {
    :deep(table.table.dataTable > tbody > tr > td:nth-child(3)) {
      padding: 0;
    }
    :deep(table.table.dataTable .langtitle) {
      width: 100px;
    }
  }
}
</style>
