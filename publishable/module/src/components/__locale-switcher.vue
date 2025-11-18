<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/i18n'
import { LOCALES } from '@/constants/locales'

const { locale } = useI18n()
const currentLocale = ref(locale.value)

const changeLocale = async (event) => {
  const newLocale = event.target.value

  try {
    await loadLocaleMessages(newLocale)
    locale.value = newLocale
    // Optional: Save to localStorage for persistence
    // localStorage.setItem('userLocale', newLocale)
  } catch (error) {
    console.error('Locale switch failed:', error)
    currentLocale.value = locale.value // Revert selection
  }
}

const getLocaleName = (code) => LOCALES[code] || code
</script>

<template>
  <div class="locale-switcher">
    <select v-model="currentLocale" @change="changeLocale">
      <option v-for="locale in Object.keys(LOCALES)" :key="locale" :value="locale">
        {{ getLocaleName(locale) }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.locale-switcher {
  margin: 10px;
}
select {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>
