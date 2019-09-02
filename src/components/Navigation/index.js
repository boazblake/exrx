import m from 'mithril'
import NavTabs from './NavTabs.js'
import NavLinks from './NavLinks.js'
import Stream from 'mithril-stream'
import { getRoute } from 'utils/helpers'

const currentRoute = getRoute(1)

const Navigation = () => {
  let tabSelected = Stream(currentRoute)
  return {
    view: ({ attrs: { mdl } }) => {
      return m(
        '.navigation',
        {
          onmouseenter: () => tabSelected(currentRoute),
          onmouseleave: () => tabSelected(currentRoute),
        },
        [m(NavTabs, { mdl, tabSelected }), m(NavLinks, { mdl, tabSelected })]
      )
    },
  }
}

export default Navigation
