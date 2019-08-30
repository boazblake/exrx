import m from 'mithril'
import Layout from './Layout.js'
import Home from './Pages/Home'
import ClinicalTrials from './Pages/ClinicalTrials'

const App = (mdl) => {
  return {
    '/home': { onmatch: () => {}, render: m(Layout, { mdl }, Home) },
    '/trials': {
      onmatch: () => {},
      render: () => m(Layout, { mdl }, m(ClinicalTrials, { mdl })),
    },
  }
}

export default App
