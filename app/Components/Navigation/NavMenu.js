const GoToTop = {
  view: ({ attrs: { mdl } }) =>
    m(
      "li.menu-item",
      m(
        "button.btn.btn-primary",
        {
          onclick: () => {
            window.scroll({
              top: 0,
              left: 0,
              behavior: "smooth"
            })
            mdl.toggleNav(mdl)
            m.route.set(mdl.state.route.route)
          }
        },
        "Top of Page"
      )
    )
}

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active, mdl } }) =>
      m(
        `li.${active ? "menu-item" : "menu-item"}`,
        m(
          m.route.Link,
          {
            onclick: () => {
              m.route.set(`${tab.route}/#${tab.id}`)
              mdl.state.scrollPos(window.scrollY)
              mdl.toggleNav(mdl)
            },
            key,
            id: `${tab.id}-key`,
            href: `${tab.route}`
          },
          tab.title
        )
      )
  }
}

const NavMenu = ({ attrs: { mdl } }) => {
  return {
    // onupdate: () => console.log('update', mdl.state.scrollPos()),
    view: ({ attrs: { mdl, routes } }) => {
      return routes.length
        ? m("ul.menu", { id: "menu" }, [
            mdl.state.scrollPos() > 0 && m(GoToTop, { mdl }),
            routes.map((tab, idx) =>
              m(Tab, {
                key: idx,
                active: mdl.state.route.route == tab.route,
                tab,
                mdl
              })
            )
          ])
        : []
    }
  }
}

export default NavMenu
