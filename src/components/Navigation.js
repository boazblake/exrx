import m from 'mithril'
import { animateSidebarEntrance } from '../utils/animations.js'

const Tab = ({ attrs: { key } }) => {
  return {
    oncreate: animateSidebarEntrance,
    view: ({ attrs: { tab } }) =>
      m(
        'a.tab',
        {
          key,
          id: `${tab}`,
          href: `${tab}`,
          oncreate: m.route.link,
        },
        tab.split('/')[1]
      ),
  }
}

const Navigation = {
  view: ({ attrs: { mdl } }) =>
    mdl.routes.map((tab, idx) =>
      m(Tab, {
        key: idx,
        active: mdl.state.route == tab,
        tab,
      })
    ),
}

export default Navigation
