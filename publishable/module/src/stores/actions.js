import { defineStore } from 'pinia'

export const useActionsStore = defineStore('actions', {
  state: () => ({
    // значения: [ btnindex: index, ... ]
    selected: [],
  }),
  getters: {
    getByIndex: (state) => (index) => state.selected[index] || 0,
  },
  actions: {
    setByIndex(index, value) {
      this.selected[index] = value
    },
  }
});
