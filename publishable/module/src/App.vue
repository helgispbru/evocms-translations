<script setup>
import { ref, reactive, computed, watch, provide, onBeforeMount, nextTick } from 'vue'
import { RouterView, useRouter } from 'vue-router'
const router = useRouter()

import { emitter } from '@/utils/emitter'

// название и иконка приложения
const title = import.meta.env.VITE_APP_TITLE || 'Module EvolutionCMS'
const icon = import.meta.env.VITE_APP_ICON || 'gear'
// константы
import { LOCALES } from '@/constants/locales'
import { ACTIONS } from '@/constants/actions'

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
const { show, dialogState, confirm, cancel } = useBsConfirmation()

import { TOAST_OPTIONS } from '@/constants/toasts'
import { useToast } from 'vue-toast-notification'
const $toast = useToast()

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
    title: t('language.tabtitle'),
    to: '/language',
    icon: 'language',
    active: true,
  },
  {
    title: t('group.tabtitle'),
    to: '/group',
    icon: 'layer-group',
    active: true,
  },
  {
    title: t('entry.tabtitle'),
    to: '/entry',
    icon: 'file-lines',
    active: true,
  },
])

async function onMenuClick(ev) {
  // язык сменить
  if (ev.startsWith('lang:')) {
    changeLocale(ev.replace('lang:', ''))
  }

  let confirmed = undefined

  // импорт/экспорт в базу
  if (ev.startsWith('db:')) {
    switch (ev.replace('db:', '')) {
      // импорт в базу
      case 'import':
        confirmed = await show({
          title: t('actions.confirm.import.title'),
          message: t('actions.confirm.import.message'),
          okButton: t('btn.import'),
          cancelButton: t('btn.cancel'),
        })

        if (!confirmed) {
          return false
        }

        $toast.info(`${t('actions.toast.importing')}`, TOAST_OPTIONS)

        if (await onImport(t)) {
          $toast.success(t('actions.toast.imported'), TOAST_OPTIONS)
          emitter.emit('tabulator:reload')
        }
        break

      // экспорт из базы
      case 'export':
        confirmed = await show({
          title: t('actions.confirm.export.title'),
          message: t('actions.confirm.export.message'),
          okButton: t('btn.export'),
          cancelButton: t('btn.cancel'),
        })

        if (!confirmed) {
          return false
        }

        $toast.info(`${t('actions.toast.exporting')}`, TOAST_OPTIONS)

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
      case 'language':
        router.push({
          path: ev.replace('add:', ''),
          query: {
            action: 'language:create',
            timestamp: Date.now(),
          },
        })
        emitter.emit('tabulator:language:add-row')
        break

      // добавить группу
      case 'group':
        router.push({
          path: ev.replace('add:', ''),
          query: {
            action: 'group:create',
            timestamp: Date.now(),
          },
        })
        emitter.emit('tabulator:group:add-row')
        break

      // добавить строку
      case 'entry':
        router.push({
          path: ev.replace('add:', ''),
          query: {
            action: 'entry:create',
            timestamp: Date.now(),
          },
        })
        emitter.emit('tabulator:entry:add-row')
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
.tab-content {
  padding-bottom: calc(var(--bs-gutter-x) * 0.5);
}
</style>
