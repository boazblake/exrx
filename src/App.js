const toRoutes = (mdl) => (acc, route) => {
  acc[route.route] = {
    onmatch: (props) => route.onmatch(mdl, props, route),
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
