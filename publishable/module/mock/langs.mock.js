// предварительный набор
const values = [
  { id: 1, code: 'en', title: 'English' },
  { id: 2, code: 'ru', title: 'Русский' },
  { id: 3, code: 'be', title: 'Белорусский' },
  { id: 4, code: 'es', title: 'Испанский' },
  { id: 5, code: 'fr', title: 'French' },
  { id: 6, code: 'de', title: 'German' },
  { id: 7, code: 'it', title: 'Italian' },
  { id: 8, code: 'ja', title: 'Japanese' },
  { id: 9, code: 'zh', title: 'Chinese' },
  { id: 10, code: 'ar', title: 'Arabic' },
  { id: 11, code: 'pt', title: 'Portuguese' },
  { id: 12, code: 'hi', title: 'Hindi' },
  { id: 13, code: 'ko', title: 'Korean' },
  { id: 14, code: 'tr', title: 'Turkish' },
  { id: 15, code: 'nl', title: 'Dutch' },
  { id: 16, code: 'sv', title: 'Swedish' },
  { id: 17, code: 'fi', title: 'Finnish' },
  { id: 18, code: 'pl', title: 'Polish' },
  { id: 19, code: 'uk', title: 'Ukrainian' },
  { id: 20, code: 'el', title: 'Greek' },
  { id: 21, code: 'he', title: 'Hebrew' },
  { id: 22, code: 'th', title: 'Thai' },
  { id: 23, code: 'vi', title: 'Vietnamese' },
  { id: 24, code: 'tl', title: 'Filipino' },
  { id: 25, code: 'xz', title: 'Xandorian' },
  { id: 26, code: 'vr', title: 'Vortian' },
  { id: 27, code: 'zl', title: 'Zylithian' },
  { id: 28, code: 'qn', title: 'Quenoran' },
  { id: 29, code: 'dm', title: 'Dremish' },
  { id: 30, code: 'sf', title: 'Sylvanian' },
  { id: 31, code: 'lc', title: 'Lunarian' },
  { id: 32, code: 'cb', title: 'Celestial' },
  { id: 33, code: 'dr', title: 'Dragonian' },
  { id: 34, code: 'ph', title: 'Phoenix' },
  { id: 35, code: 'mt', title: 'Mythrian' },
  { id: 36, code: 'st', title: 'Stellarian' },
  { id: 37, code: 'cr', title: 'Crystalic' },
  { id: 38, code: 'nb', title: 'Nebulon' },
  { id: 39, code: 'et', title: 'Etherian' },
  { id: 40, code: 'ch', title: 'Chronosian' }
]

import { URL_PATH } from '../src/constants/settings'

import qs from 'qs'
import path from 'path'
import { JSONFilePreset } from 'lowdb/node'
const defaultData = { ...values }

const file = path.join(__dirname, 'db.json')
const db = await JSONFilePreset(file, defaultData)

const http4xxErrors = [
  400, // Bad Request
  401, // Unauthorized
  402, // Payment Required
  403, // Forbidden
  404, // Not Found
  405, // Method Not Allowed
  406, // Not Acceptable
  407, // Proxy Authentication Required
  408, // Request Timeout
  409, // Conflict
  410, // Gone
  411, // Length Required
  412, // Precondition Failed
  413, // Payload Too Large
  414, // URI Too Long
  415, // Unsupported Media Type
  416, // Range Not Satisfiable
  417, // Expectation Failed
  418, // I'm a teapot (RFC 2324)
  421, // Misdirected Request
  422, // Unprocessable Entity (WebDAV)
  423, // Locked (WebDAV)
  424, // Failed Dependency (WebDAV)
  425, // Too Early
  426, // Upgrade Required
  428, // Precondition Required
  429, // Too Many Requests
  431, // Request Header Fields Too Large
  451  // Unavailable For Legal Reasons
];

const http5xxErrors = [
  500, // Internal Server Error
  501, // Not Implemented
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
  505, // HTTP Version Not Supported
  506, // Variant Also Negotiates (RFC 2295)
  507, // Insufficient Storage (WebDAV)
  508, // Loop Detected (WebDAV)
  510, // Not Extended (RFC 2774)
  511  // Network Authentication Required
];

function getDynamicRandomError() {
  const errorTypes = ["Client", "Server", "Auth", "Timeout", "Invalid"];
  const errorActions = ["Request", "Access", "Operation", "Connection", "Data"];
  const errorReasons = ["failed", "denied", "rejected", "timed out", "not found"];

  // Build a random error string
  const randomError =
    `${errorTypes[Math.floor(Math.random() * errorTypes.length)]} ` +
    `${errorActions[Math.floor(Math.random() * errorActions.length)]} ` +
    `${errorReasons[Math.floor(Math.random() * errorReasons.length)]}`;

  return randomError.length > 50
    ? randomError.substring(0, 47) + "..."
    : randomError;
}

const getBody = async (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
  });
};

async function getRandomResponse(r, req, res) {
  res.setHeader('Content-Type', 'application/json')

  // const url = new URL(req.url, `http://${req.headers.host}`);
  // const queryParams = Object.fromEntries(url.searchParams.entries());
  // const body = await getBody(req);

  let code = 0

  if (r) {
    // success
    code = 200
    res.statusCode = code;
    res.end(JSON.stringify({
      code: code,
      data: { 'result': 'success' },
      message: '',
      error: null, // только когда ошибка
      timestamp: new Date().toISOString()
    }));
  } else {
    // no luck
    if (Math.random() >= 0.5) {
      // ошибка из 4xx
      code = http4xxErrors[Math.floor(Math.random() * http4xxErrors.length)]
    } else {
      // ошибка из 5xx
      code = http5xxErrors[Math.floor(Math.random() * http5xxErrors.length)]
    }

    res.statusCode = code;
    res.end(JSON.stringify({
      code: code,
      data: { 'result': 'error' },
      message: '',
      error: getDynamicRandomError(), // только когда ошибка
      timestamp: new Date().toISOString()
    }));
  }
}

export default [
  // список языков
  {
    url: `${URL_PATH}/languages`,
    method: 'get',
    response: ({ query }) => {
      const parsedQuery = qs.parse(qs.stringify(query))

      /*
      // -- запрос
      draw => Integer, // порядковый номер показываемой таблицы
      columns => [ // какие колонки
        n => [
          data => id, // ?
          name => '', // ?
          searchable => Boolean,
          orderable => Boolean,
          search => [
            value => '',
            regex => '' || false
          ],
        ]
      ],
      order => [ // присутствует если есть сортировка
        n => [
          column => 'id',
          dir => 'asc' || 'desc',
          name => '' // ?
        ]
      ]
      start => Integer,
      length => Integer,
      search => [
        value => '',
        regex => '' || false
      ]
      _ => Integer
      */

      // -- ответ
      /*
      code => Integer, // ?
      data => [
        n => { 'name1': 'value1', 'name2': 'value2', '...' }
      ],
      draw => Integer, // порядковый номер показываемой таблицы
      recordsFiltered => Integer,
      recordsTotal => Integer,
      */

      // исходные данные
      let copy = [...db.data.values]

      // поиск
      if (parsedQuery.search) {
        const str = parsedQuery.search['value']

        copy = copy.filter(el => el.title.search(str) > -1)
      }

      // сортировка
      if (parsedQuery.order) {
        // поле сортировки: query.columns[query.order[0].column].data
        // направление сортировки: query.order[0].dir

        const colid = parsedQuery.order[0].column
        const field = parsedQuery.columns[colid].data

        switch (parsedQuery.order[0].dir) {
          case 'asc':
            if (field == 'id') {
              copy.sort((a, b) => Number(a[field]) - Number(b[field]))
            } else {
              copy.sort((a, b) => String(a[field]).localeCompare(b[field]))
            }
            break;
          case 'desc':
            if (field == 'id') {
              copy.sort((a, b) => Number(b[field]) - Number(a[field]))
            } else {
              copy.sort((a, b) => String(b[field]).localeCompare(a[field]))
            }
            break;
        }
      }

      return {
        code: 200,
        draw: Number(parsedQuery.draw),
        recordsTotal: copy.length,
        recordsFiltered: copy.length,
        data: copy.slice(Number(parsedQuery.start), Number(parsedQuery.start) + Number(parsedQuery.length)),
        // message: '',
        // error: '', // только когда ошибка
      }
    }
  },
  // получить язык
  {
    url: `${URL_PATH}/languages/:id`,
    method: 'get',
    response: ({ query }) => {
      return {
        code: 0,
        data: db.data.values.find((el) => { return el.id == query.id }),
        // message: '',
        // error: '', // только когда ошибка
      }
    }
  },
  // создать язык
  {
    url: `${URL_PATH}/languages`,
    method: 'post',
    rawResponse: async (req, res) => {
      // случайный ответ
      const r = Math.random() >= 0.5

      if (r) {
        // ??
      }

      await getRandomResponse(r, req, res)
    }
  },
  // редактировать язык
  {
    url: `${URL_PATH}/languages/:id`,
    method: 'put',
    rawResponse: async (req, res) => {
      const id = req.url.split('/').pop()

      // случайный ответ
      const r = Math.random() >= 0.5

      if (r) {
        const found = db.data.values.findIndex(el =>
          el.id == parseInt(id)
        )

        if (found > -1) {
          const body = await getBody(req);
          db.data.values[found] = {
            id: parseInt(id),
            code: body.code,
            title: body.title
          }
          await db.write()
        }
      }

      await getRandomResponse(r, req, res)
    }
  },
  // удалить язык
  {
    url: `${URL_PATH}/languages/:id`,
    method: 'delete',
    rawResponse: async (req, res) => {
      const id = req.url.split('/').pop()

      // случайный ответ
      const r = Math.random() >= 0.5

      if (r > 0.5) {
        const found = db.data.values.findIndex(el =>
          el.id == id
        )
        if (found !== -1) {
          db.data.values.splice(found, 1);
          await db.write()
        }
      }

      await getRandomResponse(r, req, res)
    }
  },
]
