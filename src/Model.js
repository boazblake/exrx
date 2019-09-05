// import m from 'mithril'
import Stream from 'mithril-stream'
import http from './Utils/http.js'
import Routes from './Routes/index.js'

export const model = {
  Routes,
  http,
  data: Stream({}),
  state: {
    loadingProgress: {
      max: 0,
      value: 0,
    },
    isAuth: Stream(false),
    paginate: { from: 1, size: 10, total: 0 },
    isLoading: Stream(false),
    url: '',
    route: '',
    scrollPos: 1,
    limit: 10,
    profile: '',
    showAuthModal: Stream(false),
    showSettings: Stream(false),
    showNav: Stream(false),
    toast: {
      show: Stream(false),
      class: Stream('primary'),
      contents: Stream('content'),
    },
    query: Stream(''),
  },
  toggleToast: (mdl) => mdl.state.toast.show(!mdl.state.toast.show()),
  toggleAuthModal: (mdl) => mdl.state.showAuthModal(!mdl.state.showAuthModal()),
  toggleSettings: (mdl) => mdl.state.showSettings(!mdl.state.showSettings()),
  toggleNav: (mdl) => mdl.state.showNav(!mdl.state.showNav()),
  filterData: (mdl) => (query) => mdl.state.query(query),
}
