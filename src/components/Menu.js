import m from 'mithril'
import { scrollToAnchor } from 'utils/helpers'

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active } }) =>
      m(
        'li.menu-item',
        m(
          m.route.Link,
          {
            class: active ? ' active menu-item ' : 'menu-item',
            onclick: (e) => {
              console.log('EVENT', e)
              m.route.set(tab.route, { a: tab.id })
              scrollToAnchor(tab.id)
            },
            key,
            id: `${tab.id}-key`,
            href: `${tab.route}`,
          },
          tab.title
        )
      ),
  }
}

const Menu = {
  view: ({ attrs: { mdl } }) => {
    let route = m.route.get().split('/')[2]
    console.log('MENU', route)

    let routes = mdl.Routes.filter((r) => r.group.includes(route))
    return m(
      'ul.menu',
      { id: 'menu' },
      routes.map((tab, idx) =>
        m(Tab, {
          key: idx,
          active: mdl.state.route.route == tab.route,
          tab,
        })
      )
    )
  },
}

export default Menu
