import m from 'mithril'

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
  const isActive = (route) => m.route.get().split('/')[1] == route.id

  return {
    view: ({ attrs: { classList, routes, mdl } }) =>
      m(
        'nav.nav',
        {
          id: 'navbar',
          class: classList,
        },
        routes.map((tab, idx) =>
          m(Tab, {
            class: 'nav-item',
            key: idx,
            active: isActive(tab),
            tab,
            mdl,
          })
        )
      ),
  }
}

export default Navigation
