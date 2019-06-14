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

function onLoad(e) {
  model.state.isLoading(true)
  return false
}

function onLoadStart(e) {
  console.log('onLoadStart', e)
  return false
}
function onLoadEnd(e) {
  model.state.isLoading(false)

  console.log('onLoadEnd', e)
  return false
}

const xhrProgress = {
  config: (xhr) => {
    console.log('xhr', xhr)
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
  limits: [30, 40, 50, 60, 70, 80, 90, 100],
  data: {},
  state: {
    loadingProgress: {
      max: 0,
      value: 0,
    },
    isLoading: Stream(false),
    url: '',
    route: '',
    scrollPos: 1,
    limit: 30,
    profile: '',
    showLimits: Stream(false),
    showNavigation: Stream(false),
    showNav: Stream(false),
  },
  toggleLimits: (mdl) => mdl.state.showLimits(!mdl.state.showLimits()),
  showTabs: (mdl) => mdl.state.showNav(!mdl.state.showNav()),
}
