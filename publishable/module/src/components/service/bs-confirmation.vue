<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useBsConfirmation } from '@/composable/useBsConfirmation.js'

const { dialogState, confirm, cancel } = useBsConfirmation()

function handleKeydown(e) {
  if (e.key == 'Escape') {
    cancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <transition name="fade">
    <div v-if="dialogState.visible" class="bs-confirmation">
      <div
        class="modal fade"
        :class="{ show: dialogState.visible, 'd-block': dialogState.visible }"
        tabindex="-1"
        :aria-hidden="!dialogState.visible"
        :aria-modal="dialogState.visible"
        role="dialog"
        @click.self="cancel()"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-secondary bg-opacity-50">
              <h3 class="modal-title fs-6">{{ dialogState.title }}</h3>
              <button
                type="button"
                class="btn-close"
                aria-label="Закрыть"
                @click="cancel()"
              ></button>
            </div>
            <div class="modal-body" v-html="dialogState.message"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary my-0" @click="confirm">
                {{ dialogState.okButton }}
              </button>
              <button type="button" class="btn btn-secondary my-0" @click="cancel">
                {{ dialogState.cancelButton }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" :class="{ show: dialogState.visible }"></div>
    </div>
  </transition>
</template>

<style lang="scss">
/* css class for the transition */
.fade {
  &-enter {
    opacity: 0;

    &-active {
      transition: opacity 0.3s;
    }
  }
  &-leave {
    &-active {
      transition: opacity 0.3s;
    }
    &-to {
      opacity: 0;
    }
  }
}

.bs-confirmation {
  //
}
</style>
