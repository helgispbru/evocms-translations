// создать язык
export const createTabulatorLang = (t) => ({
  data: {
    loading: t('tabulator.data.loading'),
    error: t('tabulator.data.error'),
  },
  pagination: {
    page_size: t('tabulator.pagination.page_size'),
    // btn
    first: t('tabulator.pagination.first'),
    prev: t('tabulator.pagination.prev'),
    next: t('tabulator.pagination.next'),
    last: t('tabulator.pagination.last'),
    // title on hover
    first_title: t('tabulator.pagination.first_title'),
    last_title: t('tabulator.pagination.last_title'),
    prev_title: t('tabulator.pagination.prev_title'),
    next_title: t('tabulator.pagination.next_title'),
    //
    all: t('tabulator.pagination.all'),
    counter: {
      showing: t('tabulator.pagination.counter.showing'),
      of: t('tabulator.pagination.counter.of'),
      rows: t('tabulator.pagination.counter.rows'),
      pages: t('tabulator.pagination.counter.pages'),
      items: t('tabulator.pagination.counter.items'),
    },
  },
})

// обновить язык
export const updateTabulatorLanguage = (tabulator, t, locale) => {
  if (!tabulator) return;

  const langPack = createTabulatorLang(t);

  tabulator.modules.localize.installLang(locale, langPack);
  tabulator.setLocale(locale);
}
