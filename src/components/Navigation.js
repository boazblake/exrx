import m from 'mithril'

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab } }) =>
      m(
        m.route.Link,
        {
          class: 'btn btn-link',
          key,
          id: `${tab}`,
          href: `${tab}`,
        },
        tab.title
      ),
  }
}

const Navigation = {
  view: ({ attrs: { classList, routes, mdl } }) =>
    m(
      'ul',
      {
        class: classList,
      },
      routes.map((tab, idx) =>
        m(Tab, {
          key: idx,
          active: mdl.state.route == tab.route,
          tab,
        })
      )
    ),
}

export default Navigation
