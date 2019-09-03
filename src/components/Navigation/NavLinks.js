import m from 'mithril'
import { getRoute } from 'utils'

const NavLink = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { route, active } }) =>
      m(
        'li',
        m(
          m.route.Link,
          {
            class: active ? 'btn btn-primary active' : 'btn btn-link',
            key,
            id: `${route.id}`,
            href: `${route.route}`,
          },
          route.title
        )
      ),
  }
}

const NavLinks = () => {
  return {
    view: ({ attrs: { mdl, tabSelected } }) => {
      let routes = mdl.Routes.filter((r) => r.group.includes(tabSelected()))

      const isActive = (route) => {
        let _active = getRoute(2)
        return route.id == _active
      }

      return m(
        '.nav-links bg-secondary',
        m(
          `ul.accordian-body nav ${routes.length ? 'active' : 'hide'}`,
          {
            id: 'navbar',
          },

          routes.map((route, idx) =>
            m(NavLink, {
              class: 'nav-item',
              key: idx,
              active: isActive(route),
              route,
              mdl,
            })
          )
        )
      )
    },
  }
}

export default NavLinks
