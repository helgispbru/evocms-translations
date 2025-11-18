<script setup>
import { toRefs } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// const model = defineModel()
const emit = defineEmits(['click'])
const props = defineProps({
  type: {
    type: String,
    default: 'secondary',
  },
  icon: {
    type: String,
    default: 'question',
  },
})
const { type, icon } = toRefs(props)
</script>

<template>
  <a class="btn" :class="`btn-${type}`" href="#" @click.prevent="emit('click')">
    <font-awesome-icon :icon="icon" /><span><slot></slot></span>
  </a>
</template>
