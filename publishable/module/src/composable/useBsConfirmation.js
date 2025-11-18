import { reactive } from 'vue'

const dialogState = reactive({
  visible: false,
  title: '',
  message: '',
  okButton: null,
  cancelButton: null,
  resolve: null,
})

export function useBsConfirmation() {
  const show = (obj) => {
    if (Object.hasOwn(obj, 'title')) {
      dialogState.title = obj.title
    }

    if (Object.hasOwn(obj, 'message')) {
      dialogState.message = obj.message
    }

    if (Object.hasOwn(obj, 'okButton')) {
      dialogState.okButton = obj.okButton
    }
    if (Object.hasOwn(obj, 'cancelButton')) {
      dialogState.cancelButton = obj.cancelButton
    }

    dialogState.visible = true

    return new Promise((resolve) => {
      dialogState.resolve = resolve;
    })
  }

  const confirm = () => {
    dialogState.visible = false
    dialogState.resolve(true)
  };

  const cancel = () => {
    dialogState.visible = false
    dialogState.resolve(false)
  };

  return {
    dialogState,
    show,
    confirm,
    cancel,
  };
}
