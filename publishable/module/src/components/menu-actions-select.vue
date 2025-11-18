<script setup>
import { toRefs, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { useActionsStore } from '@/stores/actions'
const actionsStore = useActionsStore()
const { selected } = storeToRefs(actionsStore)

// const model = defineModel()
const emit = defineEmits(['click'])
const props = defineProps({
  type: {
    type: String,
    default: 'secondary',
  },
  items: {
    type: Array,
    default: () => [],
  },
  // номер группы кнопок в ряду
  btnindex: {
    type: Number,
    default: 0,
  },
})
const { type, items, btnindex } = toRefs(props)

// тыкнуть в кнопку в списке
function clickButtonSelect(col, el) {
  actionsStore.setByIndex(col, el)

  clickButtonActive(el)
}

// тыкнуть в активную кнопку
function clickButtonActive(el) {
  emit('click', items.value[el].action)
}

onBeforeMount(() => {
  if (typeof selected.value[btnindex.value] === 'undefined') {
    actionsStore.setByIndex(btnindex.value, 0)
  }
})
</script>

<template>
  <div class="btn-group">
    <button
      type="button"
      class="btn"
      :class="`btn-${type}`"
      @click.prevent="clickButtonActive(selected[btnindex])"
    >
      <font-awesome-icon :icon="items[selected[btnindex]].icon" /><span>{{
        items[selected[btnindex]].title
      }}</span>
    </button>
    <button
      type="button"
      class="btn dropdown-toggle dropdown-toggle-split"
      :class="`btn-${type}`"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <span class="visually-hidden">Toggle Dropdown</span>
    </button>
    <ul class="dropdown-menu">
      <li v-for="(el, index) in items" :key="index">
        <a
          v-if="el.action"
          class="dropdown-item"
          href="#"
          @click.prevent="clickButtonSelect(btnindex, index)"
          >{{ el.title }}</a
        >
        <hr v-else class="dropdown-divider" />
      </li>
    </ul>
  </div>
</template>
