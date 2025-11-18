import { defineStore } from 'pinia';

export const useEntriesStore = defineStore('entries', {
  state: () => ({
    tableKey: 0,
  }),
  actions: {
    increaseTableKey() {
      this.tableKey++;
    }
  }
});
