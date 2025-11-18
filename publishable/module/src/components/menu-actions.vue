<script setup>
import { inject, toRefs } from 'vue'

import menuActionsSelect from './menu-actions-select.vue'
import menuActionsBtn from './menu-actions-btn.vue'

const locale = inject('locale')

// const model = defineModel()
const emit = defineEmits(['click'])
const props = defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
})
const { actions } = toRefs(props)
</script>

<template>
  <div class="actions">
    <div class="btn-group">
      <template v-for="(el, index) in actions">
        <menu-actions-btn
          v-if="el.items.length == 1"
          :key="`single-${index}-${locale}`"
          :type="el.type"
          :icon="el.items[0].icon"
          @click="emit('click', el.items[0].action)"
          >{{ el.items[0].title }}</menu-actions-btn
        >
        <menu-actions-select
          v-else
          :key="`multiple-${index}-${locale}`"
          :type="el.type"
          :items="el.items"
          :btnindex="index"
          @click="emit('click', $event)"
        ></menu-actions-select>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.actions {
  background: rgba(199, 199, 199, 0.25);
  padding: 0.5rem;
  position: fixed;
  top: 0;
  right: 0;
  text-align: right;
  z-index: 1001;
  border-radius: 0 0 0.3rem 0.3rem;

  @media (min-width: 840px) {
    right: 1rem;
  }

  :deep(.btn-group) {
    //
  }

  :deep(.dropdown-item) {
    --bs-dropdown-font-size: 1em;
  }

  :deep(.btn) {
    --bs-btn-font-size: 1em;

    svg {
      display: block;
      width: 1em;
      font-size: 1em;
      text-align: center;
      @media (min-width: 840px) {
        display: none;
      }
    }
    span {
      display: none;
      @media (min-width: 840px) {
        display: inline-block;
      }
    }
  }

  :deep(.btn-success) {
    // тень у зеленой
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.07);

    &:hover {
      box-shadow: none;
    }
  }

  :deep(.dropdown-toggle::after) {
    transition-duration: 0.25s;
  }
  :deep(.dropdown-toggle.show::after) {
    transform: rotate(180deg);
  }

  // bootstrap
  :deep(.dropdown-menu) {
    --bs-dropdown-padding-x: 0;
    --bs-dropdown-padding-y: 0;

    // --bs-dropdown-font-size: 0.6772rem;
    --bs-dropdown-font-size: 1em;

    --bs-dropdown-border-radius: 0;

    --bs-dropdown-link-color: #292b2c;
    --bs-dropdown-link-hover-color: #292b2c;
    --bs-dropdown-link-hover-bg: #e6e6e6;
    --bs-dropdown-link-active-color: #191b1c;
    --bs-dropdown-link-active-bg: #b6b6b6;

    --bs-dropdown-item-padding-x: 1em;
    --bs-dropdown-item-padding-y: 0.46153846em;
  }

  :deep(.dropdown-divider) {
    --bs-dropdown-divider-margin-y: 0;
  }
}
</style>
