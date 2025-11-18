import { defineStore } from "pinia";
import { markRaw } from "vue";

export const useModalStore = defineStore("modal", {
  state: () => ({
    isOpen: false,
    view: {},
    actions: [],
    title: '',
    size: '',
    data: {},
    //
    resolvePromise: null,
  }),
  getters: {
    getData: (state) => state.data,
  },
  actions: {
    open(view, actions) {
      this.actions = actions;
      // using markRaw to avoid over performance as reactive is not required
      this.view = markRaw(view);

      this.isOpen = true;
      document.getElementsByTagName('body')[0].classList.add('modal-open');

      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },
    close(data = null) {
      this.isOpen = false;
      document.getElementsByTagName('body')[0].classList.remove('modal-open');

      if (this.resolvePromise) {
        this.resolvePromise(data);
        this.resolvePromise = null;
      }

      this.view = {};
      this.actions = [];

      this.title = '';
      this.size = '';
      this.data = {};
    },
    setTitle(value) {
      this.title = value;
    },
    setSize(value) {
      this.size = value;
    },
    setData(value) {
      this.data = value;
    }
  },
});

export default useModalStore;
