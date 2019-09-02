import m from 'mithril'
import NavTabs from './NavTabs.js'
import NavLinks from './NavLinks.js'
import Stream from 'mithril-stream'
import { getRoute } from 'utils/helpers'

const Navigation = () => {
  let tabHovered = Stream(getRoute(1))
  return {
    view: ({ attrs: { mdl } }) => {
      return [m(NavTabs, { mdl, tabHovered }), m(NavLinks, { mdl, tabHovered })]
    },
  }
}

export default Navigation
