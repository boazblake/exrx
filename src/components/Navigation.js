import m from 'mithril'
import Hamburger from './Hamburger.js'

const Tab = ({ attrs: { key } }) => {
  return {
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
  view: ({ attrs: { mdl } }) => [
    m(Hamburger, { mdl }),
    mdl.routes.map((tab, idx) =>
      m(Tab, {
        key: idx,
        active: mdl.state.route == tab,
        tab,
      })
    ),
  ],
}

export default Navigation
