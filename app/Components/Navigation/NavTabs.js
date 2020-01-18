import { getRoute } from "Utils"
import AuthComponent from "Components/Auth"
import SettingsMenu from "./SettingsMenu.js"
import Icons from "Components/Icons"

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { mdl, tab, active } }) =>
      m(
        m.route.Link,
        {
          class: active ? "tab-item active" : "tab-item",
          key,
          id: `${tab.id}`,
          onclick: (e) => {
            if (tab.id == "dashboard" && mdl.state.profile != "desktop") {
              e.stopPropagation()
              e.preventDefault()
              mdl.toggleSidebarModal(mdl)
            }
          },
          href: tab.group.includes("authenticated")
            ? `/EXRX/${mdl.user.name}/${tab.id}`
            : `${tab.route}`
        },
        ["Dashboard", "Home"].includes(tab.title)
          ? m(".img", { style: { width: "50px" } }, Icons.logo)
          : tab.title
      )
  }
}

const NavTabs = () => {
  return {
    view: ({ attrs: { mdl } }) => {
      let tabs = mdl.state.isAuth()
        ? mdl.Routes.filter((r) => r.position.includes("auth-nav"))
        : mdl.Routes.filter((r) => r.position.includes("nav"))

      const isTabActive = (tab) => {
        let _active = getRoute(1)
        // console.log(tab.id, _active)
        return tab.id == _active
      }

      return [
        m(
          "ul.tab tab-group",
          {
            id: "tabbar"
          },

          [
            tabs.map((tab, idx) =>
              m(
                "li.tab-item",
                m(Tab, {
                  key: idx,
                  active: isTabActive(tab),
                  tab,
                  mdl
                })
              )
            ),
            mdl.state.isAuth()
              ? m(SettingsMenu, {
                  mdl
                })
              : m(
                  "li.tab-item",
                  m(
                    "button.btn btn-action",
                    {
                      id: "login-reg-button",
                      onclick: () => mdl.toggleAuthModal(mdl)
                    },
                    "Login / Register"
                  )
                ),
            mdl.state.showAuthModal() && m(AuthComponent, { mdl })
          ]
        )
      ]
    }
  }
}

export default NavTabs
