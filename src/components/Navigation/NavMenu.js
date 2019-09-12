import m from 'mithril'

const goToTop = (mdl) =>
  m(
    'button.btn.btn-primary',
    {
      onclick: () => {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
        mdl.toggleNav(mdl)
      },
    },
    'Top of Page'
  )

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active, mdl } }) =>
      m(
        `li.${active ? 'menu-item' : 'menu-item'}`,
        m(
          m.route.Link,
          {
            onclick: () => {
              m.route.set(`${tab.route}/#${tab.id}`)
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
            key: idx,
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
