import m from 'mithril'

const getRoute = (int) => m.route.get().split('/')[int]

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active } }) =>
      m(
        m.route.Link,
        {
          class: active ? 'btn btn-primary active' : 'btn btn-link',
          key,
          id: `${tab.id}`,
          href: `${tab.route}`,
        },
        tab.title
      ),
  }
}

const Navigation = () => {
  return {
    view: ({ attrs: { mdl } }) => {
      let mainRoutes = mdl.Routes.filter((r) => r.position.includes('nav'))
      let subRoutes = mdl.Routes.filter((r) => r.group.includes(getRoute(1)))

      const isMainActive = (route) => {
        let _active = getRoute(1)
        console.log('MAIN', _active)
        return route.id == _active
      }

      const isSubActive = (route) => {
        let _active = getRoute(2)
        console.log('SUB', _active)
        return route.id == _active
      }

      return [
        m(
          'nav.nav',
          {
            id: 'navbar',
          },

          mainRoutes.map((tab, idx) =>
            m(Tab, {
              class: 'nav-item',
              key: idx,
              active: isMainActive(tab),
              tab,
              mdl,
            })
          )
        ),
        m(
          'nav.nav',
          {
            id: 'navbar',
          },

          subRoutes.map((tab, idx) =>
            m(Tab, {
              class: 'nav-item',
              key: idx,
              active: isSubActive(tab),
              tab,
              mdl,
            })
          )
        ),
      ]
    },
  }
}

export default Navigation
