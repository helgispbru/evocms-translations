<script setup>
import { computed, toRefs } from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { RouterLink, useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// const model = defineModel()
// const emit = defineEmits()
const props = defineProps({
  tabs: {
    type: Array,
    default: () => [],
  },
})
const { tabs } = toRefs(props)

// стрелки
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
library.add(faChevronLeft, faChevronRight)

const isTabFirst = computed(() => {
  const found = tabs.value.find((element) => element.active)
  return !found || found.to === route.path
})
const isTabLast = computed(() => {
  const found = tabs.value.findLast((element) => element.active)
  return !found || found.to === route.path
})

function onClickPrev() {
  if (isTabFirst.value) {
    return
  }

  const current = tabs.value.findIndex((element) => element.to === route.path)
  const prev = tabs.value.slice(0, current).findLast((element) => element.active)

  if (prev) {
    router.push({ path: prev.to })
  }
}
function onClickNext() {
  if (isTabLast.value) {
    return
  }

  const current = tabs.value.findIndex((element) => element.to === route.path)
  const next = tabs.value.slice(current + 1).find((element) => element.active)

  if (next) {
    router.push({ path: next.to })
  }
}
</script>

<template>
  <header class="nav-wrapper">
    <span class="arrow prev" :class="{ disabled: isTabFirst }" @click="onClickPrev()">
      <font-awesome-icon icon="chevron-left"
    /></span>
    <ul class="nav nav-tabs" role="tablist">
      <li v-for="tab in tabs" :key="tab.to" class="nav-item">
        <router-link
          :to="tab.to"
          class="nav-link"
          :class="{ disabled: !tab.active }"
          :aria-disabled="!tab.active"
          ><font-awesome-icon :icon="tab.icon" /> {{ tab.title }}</router-link
        >
      </li>
    </ul>
    <span class="arrow next" :class="{ disabled: isTabLast }" @click="onClickNext()">
      <font-awesome-icon icon="chevron-right"
    /></span>
  </header>
</template>

<style lang="scss" scoped>
// wraper
.nav-wrapper {
  --bs-nav-tabs-border-width: 1px;
  --bs-nav-tabs-border-color: #ddd;
  display: flex;

  .nav-tabs {
    flex-grow: 1;
  }

  .arrow {
    display: inline-flex;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    line-height: 2.7rem;
    cursor: pointer;
    transition-duration: 0.2s;
    width: 1.5rem;
    border-bottom: var(--bs-nav-tabs-border-width) solid var(--bs-nav-tabs-border-color);

    &.prev {
      //
    }
    &.next {
      //
    }

    &.disabled {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.2);
      pointer-events: none;
    }
  }
}

// bootstrap
.nav {
  --bs-nav-link-padding-x: 0.875rem;
  --bs-nav-link-padding-y: 0;
  --bs-nav-link-font-size: 0.75rem;
  --bs-nav-link-font-weight: 400;
  --bs-nav-link-color: #0009;
  --bs-nav-link-hover-color: #444;
  // --bs-nav-link-disabled-color: var(--bs-secondary-color);

  &-tabs {
    --bs-nav-tabs-border-width: 1px;
    --bs-nav-tabs-border-color: #ddd;
    --bs-nav-tabs-border-radius: 0;
    --bs-nav-tabs-link-hover-border-color: #ddd;
    --bs-nav-tabs-link-active-color: #444;
    --bs-nav-tabs-link-active-bg: #fff;
    --bs-nav-tabs-link-active-border-color: #ddd;
    border-bottom: var(--bs-nav-tabs-border-width) solid var(--bs-nav-tabs-border-color);

    .nav-link {
      margin-bottom: calc(-1 * var(--bs-nav-tabs-border-width));

      border: var(--bs-nav-tabs-border-width) solid transparent;
      border-top-left-radius: var(--bs-nav-tabs-border-radius);
      border-top-right-radius: var(--bs-nav-tabs-border-radius);

      text-transform: uppercase;
      padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x);
      line-height: 2.45rem;

      & > svg {
        margin-right: 0.5em;
      }

      &.router-link-active,
      &.active,
      &.show .nav-link {
        --bs-nav-link-font-weight: 700;
        color: var(--bs-nav-tabs-link-active-color);
        background-color: var(--bs-nav-tabs-link-active-bg);
        border-color: var(--bs-nav-tabs-link-active-border-color);
        border-bottom-color: var(--bs-nav-tabs-link-active-bg);
      }

      &.disabled {
        text-decoration: line-through;
      }
    }
  }
}
</style>
