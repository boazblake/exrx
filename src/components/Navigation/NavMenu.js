import m from 'mithril'

const goToTop = (mdl) =>
  m(
    m.route.Link,
    {
      selector: 'button.btn.btn-primary',
      href: mdl.state.route.route,
      onclick: () => {
        window.scrollTo(0, 0)
        mdl.toggleNav(mdl)
      },
    },
    'Top of Page'
  )

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active, mdl } }) =>
      m(
        'li',
        m(
          m.route.Link,
          {
            class: active ? ' active menu-item ' : 'menu-item',
            onclick: () => {
              m.route.set(tab.route, { a: tab.id })
              mdl.toggleNav(mdl)
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

const NavMenu = {
  view: ({ attrs: { mdl } }) => {
    let route = m.route.get().split('/')[2]

    let routes = mdl.Routes.filter((r) => r.group.includes(route))
    return routes.length
      ? m('ul.menu', { id: 'menu' }, [
        window.scrollY !== 0 && m('li.menu-item', goToTop(mdl)),
        routes.map((tab, idx) =>
          m(Tab, {
            key: idx + 1,
            active: mdl.state.route.route == tab.route,
            tab,
            mdl,
          })
        ),
      ])
      : []
  },
}

export default NavMenu
