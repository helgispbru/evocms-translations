<script setup>
import { ref, reactive, computed, watch, provide, onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'

// название и иконка приложения
const title = import.meta.env.VITE_APP_TITLE || 'Module EvoCMS'
const icon = import.meta.env.VITE_APP_ICON || 'gear'
// константы
import { LOCALES } from '@/constants/locales'
import { ACTIONS } from '@/constants/actions'

// таблицы
import { useLangsStore } from '@/stores/langs'
import { useGroupsStore } from '@/stores/groups'
import { useEntriesStore } from '@/stores/entries'
const langsStore = useLangsStore()
const groupsStore = useGroupsStore()
const entriesStore = useEntriesStore()

// многоязычность приложения
import { useI18n } from 'vue-i18n'
import i18n from './i18n'
import { loadLocaleMessages } from '@/i18n'
const { t, locale } = useI18n()
const currentLocale = ref(locale.value)
provide('locale', locale)

// многоязычность для валидатора форм
import { setLocale as setLocaleVee } from '@vee-validate/i18n'

import MenuActions from '@/components/menu-actions.vue'
import navTabs from '@/components/nav-tabs.vue'

import BsModal from '@/components/service/bs-modal.vue'
import BsConfirmation from '@/components/service/bs-confirmation.vue'
import { useBsConfirmation } from '@/composable/useBsConfirmation'
const { dialogState, confirm, cancel } = useBsConfirmation()

import { TOAST_OPTIONS } from '@/constants/toasts'
import { useToast } from 'vue-toast-notification'
const $toast = useToast()

import { onAddEntry, onAddGroup, onAddLang } from '@/composable/useBsModal'

import { onImport, onExport } from '@/composable/useApiMethods'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// иконка приложения из .env
import { faGear } from '@fortawesome/free-solid-svg-icons'
library.add(faGear)
// меню actions
import {
  faLanguage,
  faLayerGroup,
  faFileLines,
  faFileImport,
  faFileExport,
} from '@fortawesome/free-solid-svg-icons'
library.add(faLanguage, faLayerGroup, faFileLines, faFileImport, faFileExport)
// меню
import {
  faArrowRight,
  faArrowDown,
  faArrowLeft,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons'
library.add(faArrowRight, faArrowDown, faArrowLeft, faArrowUp)

// кнопки
const actions = reactive([])

// табы тут
const tabs = computed(() => [
  {
    title: t('languages.tabtitle'),
    to: '/languages',
    icon: 'language',
    active: true,
  },
  {
    title: t('groups.tabtitle'),
    to: '/groups',
    icon: 'layer-group',
    active: true,
  },
  {
    title: t('entries.tabtitle'),
    to: '/entries',
    icon: 'file-lines',
    active: true,
  },
])

async function onMenuClick(ev) {
  // язык сменить
  if (ev.startsWith('lang:')) {
    changeLocale(ev.replace('lang:', ''))
  }

  // импорт/экспорт в базу
  if (ev.startsWith('db:')) {
    switch (ev.replace('db:', '')) {
      case 'import':
        // импорт в базу
        if (await onImport(t)) {
          $toast.success(t('actions.toast.imported'), TOAST_OPTIONS)

          langsStore.increaseTableKey()
          groupsStore.increaseTableKey()
          entriesStore.increaseTableKey()
        }
        break
      case 'export':
        // экспорт из базы
        if (await onExport(t)) {
          $toast.success(t('actions.toast.exported'), TOAST_OPTIONS)
        }
        break
    }
  }

  // добавить
  if (ev.startsWith('add:')) {
    switch (ev.replace('add:', '')) {
      // добавить язык
      case 'lang':
        if (await onAddLang(t)) {
          $toast.success(t('languages.toast.created'), TOAST_OPTIONS)
          langsStore.increaseTableKey()
        }
        break
      // добавить группу
      case 'group':
        if (await onAddGroup(t)) {
          $toast.success(t('groups.toast.created'), TOAST_OPTIONS)
          groupsStore.increaseTableKey()
        }
        break
      // добавить строку
      case 'entry':
        if (await onAddEntry(t)) {
          $toast.success(t('entries.toast.created'), TOAST_OPTIONS)
          entriesStore.increaseTableKey()
        }
        break
    }
  }
}

// смена локали в vue-i18n
const changeLocale = async (val) => {
  try {
    await loadLocaleMessages(i18n, val)
    locale.value = val

    // Optional: Save to localStorage for persistence
    // localStorage.setItem('userLocale', val)
  } catch (error) {
    console.error('Locale switch failed:', error)
    currentLocale.value = locale.value // Revert selection
  }
}

function changeActionsEntries() {
  // сбросить
  actions.length = 0

  // переключалка actions
  ACTIONS.forEach((el) => {
    const tmp = el.items

    tmp.forEach((item) => {
      item.title = item.code ? t(item.code) : ''
    })

    actions.push({
      type: el.type,
      items: tmp,
    })
  })

  // переключалка языков
  const langs = {
    type: 'secondary',
    items: [],
  }
  Object.keys(LOCALES).forEach((code) => {
    langs.items.push({
      title: LOCALES[code],
      code: code,
      icon: 'language',
      action: `lang:${code}`,
    })
  })

  actions.push(langs)
}

onBeforeMount(() => {
  changeActionsEntries()
})

watch(locale, (newVal, oldVal) => {
  // поменять текст в кнопках actions
  changeActionsEntries()
  // помененять тексты для VeeValidate
  setLocaleVee(newVal)
})
</script>

<template>
  <h1>
    <font-awesome-icon :icon="icon" />
    {{ title }}
  </h1>

  <menu-actions :actions="actions" @click="onMenuClick($event)"></menu-actions>

  <nav-tabs :tabs="tabs" />

  <router-view v-slot="{ Component }">
    <transition>
      <component :is="Component" />
    </transition>
  </router-view>

  <bs-modal />
  <bs-confirmation
    v-if="dialogState.visible"
    :message="dialogState.message"
    @confirm="confirm"
    @cancel="cancel"
  />
</template>

<style lang="scss">
// pages
.pagination {
  --bs-pagination-padding-x: 0.5rem;
  --bs-pagination-padding-y: 0.25rem;
  --bs-pagination-font-size: 0.875rem;
  --bs-pagination-border-radius: var(--bs-border-radius-sm);
}

// datatables
.dataTable {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
