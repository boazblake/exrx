import m from 'mithril'
import Stream from 'mithril-stream'
import Task from 'data.task'
const routes = [
  '/home',
  '/clinical-trials',
  '/interventions',
  '/diseases',
  '/terms',
]

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

const _task = (url) => (args) =>
  new Task((rej, res) =>
    m.request(url, { ...args, ...xhrProgress }).then(res, rej)
  )

const getTask = (url) => (args) => {
  return _task(url)({
    params: { ...args },
    method: 'GET',
  })
}

const postTask = (url) => (args) => _task(url)({ ...args, method: 'POST' })
const putTask = (url) => (args) => _task(url)({ ...args, method: 'PUT' })

const http = {
  getTask,
  postTask,
  putTask,
}

export default http

export const model = {
  routes,
  http,
  limits: [10, 30, 40, 50, 60, 70, 80, 90, 100],
  data: Stream({}),
  state: {
    loadingProgress: {
      max: 0,
      value: 0,
    },
    paginate: { from: 1, size: 10, total: 0 },
    isLoading: Stream(false),
    url: '',
    route: '',
    scrollPos: 1,
    limit: 10,
    profile: '',
    showLimits: Stream(false),
    showSettings: Stream(false),
    showNavigation: Stream(false),
    showModal: Stream(false),
    query: Stream(''),
  },
  toggleLimits: (mdl) => mdl.state.showLimits(!mdl.state.showLimits()),
  toggleSettings: (mdl) => mdl.state.showSettings(!mdl.state.showSettings()),
  toggleModal: (mdl) => mdl.state.showModal(!mdl.state.showModal()),
  filterData: (mdl) => (query) => mdl.state.query(query),
}
