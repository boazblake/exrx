import { makeRoute } from "Utils"

const Logout = () => {
  const onError = (mdl) => (error) => {
    console.log("error", error, mdl)
  }

  const onSuccess = (mdl) => () => {
    window.sessionStorage.removeItem("user-token")
    mdl.state.isAuth(false)
    mdl.user = null
    mdl.state.route.group.includes("authenticated") && history.back()
  }

  const logout = (mdl) =>
    mdl.http.backEnd
      .get(mdl)("users/logout")
      .fork(onError(mdl), onSuccess(mdl))

  return {
    view: ({ attrs: { mdl } }) =>
      m(
        "li.menu-item",
        m("button.btn btn-primary", { onclick: () => logout(mdl) }, "LOGOUT")
      )
  }
}

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active, mdl } }) =>
      m(
        "li.menu-item",
        m(
          "a.btn btn-link menu-item",
          {
            class: active && "active",
            onclick: () => {
              m.route.set(tab.route, { name: makeRoute(mdl.user.name) })
              mdl.toggleNav(mdl)
            },
            key,
            id: `${tab.id}-key`
            // href: `${tab.route}`,
          },
          tab.title
        )
      )
  }
}

const SettingsMenu = () => {
  return {
    showMenu: Stream(false),
    view: ({ state, attrs: { mdl } }) => {
      let routes = mdl.Routes.filter(
        (route) =>
          (route.group.includes("authenticated") &&
            route.group.includes("admin") &&
            mdl.user.isAdmin) ||
          (route.group.includes("authenticated") &&
            !route.group.includes("admin"))
      )
      return [
        m("li.dropdown dropdown-right", [
          m(
            "a.btn btn-primary dropdown-toggle",
            {
              onclick: () => state.showMenu(!state.showMenu()),
              tabindex: "0"
            },
            ["User Settings", m("i.icon icon-arrow-down")]
          ),
          state.showMenu() &&
            m("ul.menu", [
              m(".panel", [
                m(".panel-header", m(".panel-title", "Comments")),
                m(".panel-nav"),
                m(".panel-body"),
                m(".panel-footer")
              ]),
              m(Logout, { mdl }),
              routes.map((tab, idx) =>
                m(Tab, {
                  key: idx,
                  active: mdl.state.route.route == tab.route,
                  tab,
                  mdl
                })
              )
            ])
        ])
      ]
    }
  }
}

export default SettingsMenu
