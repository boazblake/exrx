const toRoutes = (mdl) => (acc, route) => {
  acc[route.route] = {
    onmatch: (args, path, fullroute) => {
      mdl.state.route = route
      mdl.state.anchor = path.split('#')[1]
      route.onmatch(mdl, args, path, fullroute)
    },
    render: () => route.component(mdl),
  }
  return acc
}

const App = (mdl) => mdl.Routes.reduce(toRoutes(mdl), {})

export default App
