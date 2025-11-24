<script setup>
// https://dev.to/cloudx/reusable-dynamic-modal-on-vue-3-1k56
import { reactive, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useModalStore } from '@/stores/modal'
const modal = useModalStore()
const { isOpen, view, actions, title, size } = storeToRefs(modal)

const model = reactive({ action: '', data: null })

function closeModal() {
  modal.close()
}

function handleKeydown(e) {
  if (e.key == 'Escape') {
    modal.close()
  }
}

watch(
  () => model.action,
  (newVal) => {
    model.action = ''

    if (newVal == 'close') {
      modal.close(model.data)
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div v-if="isOpen" class="bs-modal">
    <!-- isOpen is reactive and taken from the store, define if it is rendered or not -->
    <div
      class="modal fade"
      :class="{ show: isOpen, 'd-block': isOpen }"
      tabindex="-1"
      :aria-hidden="!isOpen"
      :aria-modal="isOpen"
      role="dialog"
      @click.self="closeModal()"
    >
      <div class="modal-dialog modal-dialog-centered" :class="size !== '' ? `modal-${size}` : ``">
        <div class="modal-content">
          <div class="modal-header bg-secondary bg-opacity-50">
            <h3 class="modal-title fs-6">{{ title }}</h3>
            <!-- @click handles the event to close the modal calling the action directly in store -->
            <button
              type="button"
              class="btn-close"
              aria-label="Закрыть"
              @click="closeModal()"
            ></button>
          </div>
          <div class="modal-body">
            <!-- dynamic components, using model to share values payload -->
            <component :is="view" v-model="model"></component>
          </div>
          <div class="modal-footer">
            <!-- render all actions and pass the model payload as parameter -->
            <button
              v-for="(action, i) in actions"
              :key="i"
              class="btn my-0"
              :class="`btn-${action.type}`"
              @click="action.callback(model)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: isOpen }"></div>
  </div>
</template>

<style lang="scss" scoped>
.bs-modal {
  //
}
</style>
