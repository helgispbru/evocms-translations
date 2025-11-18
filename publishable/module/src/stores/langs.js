import { defineStore } from 'pinia';

export const useLangsStore = defineStore('langs', {
  state: () => ({
    tableKey: 0,
  }),
  actions: {
    increaseTableKey() {
      this.tableKey++;
    }
  }
});
