import m from 'mithril'

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active } }) =>
      m(
        m.route.Link,
        {
          class: active ? 'btn btn-primary active' : 'btn-link',
          key,
          id: `${tab.id}`,
          href: `${tab.route}`,
        },
        tab.title
      ),
  }
}

const Navigation = {
  view: ({ attrs: { classList, routes, mdl } }) =>
    m(
      'ul.navbar',
      {
        id: 'navbar',
        class: classList,
      },
      routes.map((tab, idx) =>
        m(Tab, {
          class: 'nav-item',
          key: idx,
          active: mdl.state.route.route == tab.route,
          tab,
          mdl,
        })
      )
    ),
}

export default Navigation
