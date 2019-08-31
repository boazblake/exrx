import m from 'mithril'

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active } }) =>
      m(
        m.route.Link,
        {
          selector: 'li',
          class: active ? 'btn btn-primary active' : 'btn btn-link',
          key,
          id: `${tab.id}`,
          href: `${tab.route}`,
        },
        tab.title
      ),
  }
}

const Menu = {
  view: ({ attrs: { classList, mdl } }) => {
    let route = m.route.get().split('/')[1]
    // console.log('ROUTE', route)

    let routes = mdl.Routes.filter((r) => r.group.includes(route))
    return m(
      'ul',
      {
        class: classList,
      },
      [
        routes.map((tab, idx) =>
          m(Tab, {
            key: idx,
            active: mdl.state.route.route == tab.route,
            tab,
          })
        ),
      ]
    )
  },
}

export default Menu
