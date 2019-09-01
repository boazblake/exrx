import m from 'mithril'
import NavTabs from './NavTabs.js'
import NavLinks from './NavLinks.js'

const Navigation = () => {
  return {
    view: ({ attrs: { mdl } }) => [m(NavTabs, { mdl }), m(NavLinks, { mdl })],
  }
}

export default Navigation
