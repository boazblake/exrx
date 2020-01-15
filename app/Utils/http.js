import Task from "data.task"
import { BackEnd, GraphQl } from "./secrets.js"
import { model } from "../Model.js"

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
  }
}

const makeQueryString = (query) => JSON.parse(JSON.stringify(query))

const parseQLResponse = (model) => ({ data, errors }) => {
  model.state.isLoading(false)
  return errors ? Promise.reject(errors) : Promise.resolve(data)
}

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

const postQl = (model) => (query) => {
  model.state.isLoading(true)
  return new Task((rej, res) =>
    m
      .request({
        method: "POST",
        url: GraphQl.local,
        withCredentials: false,
        ...xhrProgress,
        body: makeQueryString({ query })
      })
      .then(parseQLResponse(model))
      .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
  )
}

const HttpTask = (_headers) => (method) => (mdl) => (url) => (body) => {
  mdl.state.isLoading(true)
  return new Task((rej, res) =>
    m
      .request({
        method,
        url,
        headers: {
          "content-type": "application/json",
          ..._headers
        },
        body,
        withCredentials: false,
        ...xhrProgress
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

const backEndUrl = `${BackEnd.baseUrl}/${BackEnd.APP_ID}/${BackEnd.API_KEY}/`
const backEnd = {
  getTask: (mdl) => (url) =>
    HttpTask(BackEnd.headers())("GET")(mdl)(backEndUrl + url)(null),
  postTask: (mdl) => (url) => (dto) =>
    HttpTask(BackEnd.headers())("POST")(mdl)(backEndUrl + url)(dto),
  putTask: (mdl) => (url) => (dto) =>
    HttpTask(BackEnd.headers())("PUT")(mdl)(backEndUrl + url)(dto)
}

const http = {
  backEnd,
  postQl
}

export default http
