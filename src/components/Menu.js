import m from 'mithril'

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab } }) =>
      m(
        m.route.Link,
        {
          selector: 'li',
          class: 'btn btn-link',
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
    let route = m.route.get().split('/')
    // console.log('ROUTE', route)

    let routes = mdl.Routes.filter((r) => r.group.includes(mdl.state.route.id))
    return m(
      'ul.menu',
      {
        class: classList,
      },
      [
        route.length > 2 &&
          m(
            'button.btn btn-link',
            { onclick: () => m.route.set(`/${route[1]}`) },
            'Up'
          ),

        routes.map((tab, idx) =>
          m(Tab, {
            key: idx,
            active: mdl.state.route == tab.route,
            tab,
          })
        ),
      ]
    )
  },
}

export default Menu
