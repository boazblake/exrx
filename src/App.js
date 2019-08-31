import m from 'mithril'
import Layout from './Layout.js'
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'

const App = (mdl) => {
  return {
    '/home': {
      render: () => m(Layout, { mdl }, m(Home, { mdl })),
    },
    '/about': {
      render: () => m(Layout, { mdl }, m(About, { mdl })),
    },
    '/contact': {
      render: () => m(Layout, { mdl }, m(Contact, { mdl })),
    },
  }
}

export default App
