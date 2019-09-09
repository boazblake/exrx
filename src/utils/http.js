import Task from 'data.task'
import { BackEnd } from './secrets.js'
import { model } from '../Model.js'

function onProgress(e) {
  if (e.lengthComputable) {
    model.state.loadingProgress.max = e.total
    model.state.loadingProgress.value = e.loaded
    m.redraw()
  }
}

function onLoad() {
  return false
}

function onLoadStart() {
  model.state.isLoading(true)
  return false
}

function onLoadEnd() {
  model.state.isLoading(false)
  model.state.loadingProgress.max = 0
  model.state.loadingProgress.value = 0
  return false
}

const xhrProgress = {
  config: (xhr) => {
    xhr.onprogress = onProgress
    xhr.onload = onLoad
    xhr.onloadstart = onLoadStart
    xhr.onloadend = onLoadEnd
  },
}

// const makeQuery = (string) => JSON.parse(JSON.stringify(string))

// const parseQLResponse = (model) => ({ data, errors }) => {
//   model.state.isLoading(false)
//   return errors ? Promise.reject(errors) : Promise.resolve(data)
// }

export const parseHttpError = (model) => (rej) => (Error) => {
  model.state.isLoading(false)
  return rej(Error.response)
}

export const parseHttpSuccess = (model) => (res) => (data) => {
  model.state.isLoading(false)
  return res(data)
}

// const getUserToken = () =>
//   window.sessionStorage.getItem('user-token')
//     ? window.sessionStorage.getItem('user-token')
//     : ''

// const postQl = (model) => (query) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'POST',
//         // url: graphQl,
//         withCredentials: false,
//         ...xhrProgress,
//         data: makeQuery(query),
//         headers: {
//           Authorization: `Bearer ${model.state.token}`,
//           'cache-control': 'no-cache',
//           'x-apikey': '64fecd3f0cbb54d46d7f7260b86b8ad45d31b',
//           'content-type': 'application/json',
//         },
//       })
//       .then(parseQLResponse(model))
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }

const HttpTask = (mdl) => (method) => (url) => (_headers) => (body) => {
  mdl.state.isLoading(true)
  return new Task((rej, res) =>
    m
      .request({
        method,
        url,
        headers: {
          'content-type': 'application/json',
          ..._headers,
        },
        body,
        withCredentials: false,
        ...xhrProgress,
      })
      .then(parseHttpSuccess(mdl)(res), parseHttpError(mdl)(rej))
  )
}

// const postTask = (model) => (url) => ({ dto }) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'POST',
//         url: `${url}`,
//         body: dto,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }

// const putTask = (model) => (url) => ({ dto }) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'PUT',
//         url: `${url}`,
//         body: dto,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }

// const getTask = (model) => (url) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'GET',
//         url: `${url}`,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }

// const deleteTask = (model) => (url) => (id) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'DELETE',
//         url: `${url}/${id}`,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }

const lookupLocationTask = (query) => {
  return new Task((rej, res) =>
    m
      .request({
        method: 'GET',
        url: `https://nominatim.openstreetmap.org/search?q=${query}&format=json`,
      })
      .then(res, rej)
  )
}

const nhtsaUrl = 'http://localhost:3001/nhtsa/api/'
const nhtsa = {
  get: (mdl) => (url) => HttpTask(mdl)('GET')(nhtsaUrl + '/' + url)({})(null),
}

const backEndUrl = `${BackEnd.baseUrl}/${BackEnd.APP_ID}/${BackEnd.API_KEY}/`
const backEnd = {
  get: (mdl) => (url) =>
    HttpTask(mdl)('GET')(backEndUrl + url)(BackEnd.headers)(null),
  post: (mdl) => (url) => (dto) =>
    HttpTask(mdl)('POST')(backEndUrl + url)(BackEnd.headers)(dto),
}

const http = {
  backEnd,
  nhtsa,
  HttpTask,
  // postQl,
  // postTask,
  // getTask,
  // putTask,
  // deleteTask,
  lookupLocationTask,
}

export default http
