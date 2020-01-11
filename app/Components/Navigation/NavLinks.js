import { getRoute } from "Utils"

const NavLink = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { route, active } }) =>
      m(
        "li",
        m(
          m.route.Link,
          {
            class: active ? "btn btn-primary active" : "btn btn-link",
            key,
            id: `${route.id}`,
            href: `${route.route}`
          },
          route.title
        )
      )
  }
}

const NavLinks = () => {
  return {
    view: ({ attrs: { mdl, tabSelected } }) => {
      let routes = mdl.Routes.filter(
        (r) => r.group.includes(tabSelected()) && !r.group.includes("admin")
      )

      const isActive = (route) => {
        let _active = getRoute(2)
        console.log("_active", _active)
        return route.id == _active
      }

      return m(
        `ul.nav-links menu navbar bg-secondary accordian-body ${
          routes.length ? "active" : "hide"
        }`,
        {
          id: "navbar"
        },

        routes.map((route, idx) =>
          m(NavLink, {
            class: "nav-item",
            key: idx,
            active: isActive(route),
            route,
            mdl
          })
        )
      )
    }
  }
}

export default NavLinks
