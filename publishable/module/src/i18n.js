import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

export const fallbackLocale = 'en'

const i18n = createI18n({
  legacy: false, // для composition api
  locale: fallbackLocale,
  fallbackLocale: fallbackLocale,
  messages: {},
  globalInjection: true,
})

// список компонентов
import components from '@/locales/manifest.js';

export async function loadLocaleMessages(i18n, locale) {
  const messages = await import(`@/locales/${locale}/index.js`)
  const componentTranslations = {}

  await Promise.all(
    components.map(async (component) => {
      try {
        const messages = await import(`@/locales/${locale}/${component}.js`)

        componentTranslations[component] = messages.default
      } catch (error) {
        console.warn(`No ${locale} translation for ${component}, falling back to ${fallbackLocale.toUpperCase()}`)
        try {
          const fallback = await import(`@/locales/${fallbackLocale}/${component}.js`)

          componentTranslations[component] = fallback.default
        } catch (err) {
          console.error(`Missing fallback translation for ${component}`)
        }
      }
    })
  )

  i18n.global.mergeLocaleMessage(locale, {
    ...messages.default,
    ...componentTranslations,
  });

  return nextTick();
}

export default i18n
