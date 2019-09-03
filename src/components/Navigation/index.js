import m from 'mithril'
import NavTabs from './NavTabs.js'
import NavLinks from './NavLinks.js'
import Stream from 'mithril-stream'
import { getRoute } from 'utils'

const Navigation = () => {
  let tabSelected = Stream(getRoute(1))
  return {
    view: ({ attrs: { mdl } }) => {
      return m(
        '.navigation',
        {
          onmouseenter: () => tabSelected(getRoute(1)),
          onmouseleave: () => tabSelected(getRoute(1)),
        },
        [m(NavTabs, { mdl, tabSelected }), m(NavLinks, { mdl, tabSelected })]
      )
    },
  }
}

export default Navigation
