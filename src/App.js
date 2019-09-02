// import { scrollToAnchor } from './utils/helpers'

const toRoutes = (mdl) => (acc, route) => {
  acc[route.route] = {
    onmatch: (args, path, fullroute) => {
      console.log('toRoute', 'args', args, 'path', path, 'route', fullroute)
      mdl.state.route = route
      // scrollToAnchor(path)
      route.onmatch(mdl, args, path, fullroute)
    },
    render: () => route.component(mdl),
  }
  return acc
}

const App = (mdl) => {
  return mdl.Routes.reduce(toRoutes(mdl), {})

  // return {
  //   '/home': {
  //     render: () => m(Layout, { mdl }, m(Home, { mdl })),
  //   },
  //   '/about': {
  //     render: () => m(Layout, { mdl }, m(About, { mdl })),
  //   },
  //   '/contact': {
  //     render: () => m(Layout, { mdl }, m(Contact, { mdl })),
  //   },
  // }
}

export default App
