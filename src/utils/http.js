import m from 'mithril'
import Task from 'data.task'
import model from '../Model.js'

const _http = (mdl) => {
  mdl.isLoading(!mdl.isLoading)
  return m.request
}

const _task = (url) => (args) =>
  new Task((rej, res) => _http(model)(url, args).then(res, rej))

const getTask = (url) => (args) => _task(url)({ ...args, method: 'GET' })
const postTask = (url) => (args) => _task(url)({ ...args, method: 'POST' })
const putTask = (url) => (args) => _task(url)({ ...args, method: 'PUT' })

const http = {
  getTask,
  postTask,
  putTask,
}

export default http
