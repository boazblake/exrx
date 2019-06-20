import m from 'mithril'
import Layout from './Layout.js/index.js'
import { animate } from './utils/index.js'
import Home from './Pages/Home.js'
import ClinicalTrials from './Pages/ClinicalTrials.js'

const getPage = (route) => {
  switch (route) {
  case '/home':
    return Home
  case '/clinical-trials':
    return ClinicalTrials
  }
}

const Component = {
  view: ({ attrs: { mdl } }) => {
    let route = mdl.state.route
    let Page = getPage(route)
    return m(
      'section.component',
      {
        id: 'component',
        route,
      },
      m(Page, {
        oncreate: animate,
        mdl,
      })
    )
  },
}

const init = (mdl) => (path) => {
  mdl.state.route = path
  mdl.state.scrollPos = 1
  mdl.state.showNav(false)
}

const makeRoutes = (mdl) => (toRoute) => (routes, route) => {
  routes[route] = toRoute(mdl)
  return routes
}

const toRoute = (mdl) => ({
  onmatch: (_, path) => init(mdl)(path),
  render: () =>
    m(
      Layout,
      {
        mdl,
      },
      m(Component, {
        mdl,
      })
    ),
})

export const App = (mdl) => mdl.routes.reduce(makeRoutes(mdl)(toRoute), {})
