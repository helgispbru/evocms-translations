export default {
  tabtitle: 'Groups',
  title: 'Edit groups',
  cols: {
    code: 'CODE',
    title: 'TITLE',
    actions: 'ACTIONS',
  },
  modal: {
    delete: 'Delete group',
    deletemsg: 'Confirm group deletion, all entries for this group will also be deleted.',
  },
  toast: {
    created: 'Group created',
    edited: 'Group edited',
    deleted: 'Group deleted',
  },
  form: {
    code: 'Code',
    title: 'Title',
    error: {
      nocode: 'Code is required',
      notitle: 'Title is required',
      // noid: 'No group ID',
      // noaction: 'No group action',
    }
  }
}
