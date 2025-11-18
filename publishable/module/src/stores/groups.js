import { defineStore } from 'pinia';

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    tableKey: 0,
  }),
  actions: {
    increaseTableKey() {
      this.tableKey++;
    }
  }
});
