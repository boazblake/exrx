const Tab = ({ attrs: { key } }) => {
  const getUser = (user) => (user ? user.name : "")
  return {
    view: ({ attrs: { tab, active, mdl } }) =>
      m(
        `li.nav-item ${active ? "active" : ""}`,
        m(
          m.route.Link,
          {
            key,
            class: "sidebar-nav",
            id: `${tab.id}-link`,
            href: tab.group.includes("authenticated")
              ? `EXRX/${getUser(mdl.user)}/${tab.id}`
              : `${tab.route}`
          },
          tab.title
        )
      )
  }
}

const NavMenu = ({ attrs: { mdl } }) => {
  return {
    view: ({ attrs: { mdl, routes } }) => {
      return routes.length
        ? m("ul.nav", { id: "menu" }, [
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
