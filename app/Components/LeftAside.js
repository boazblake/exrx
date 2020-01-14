import NavMenu from "./Navigation/NavMenu.js"
import { SlideInRight, SlideOutLeft } from "Utils/animations"
import { without, propEq } from "ramda"

const LeftAside = ({ attrs: { mdl } }) => {
  let routes = mdl.Routes.filter((r) => r.position.includes("left-aside"))

  if (mdl.state.profile == "desktop") {
    routes = routes.filter((r) => r.id != "dashboard")
  }

  return {
    oncreate: SlideInRight,
    onbeforeremove: SlideOutLeft,
    view: ({ attrs: { mdl } }) =>
      m(
        ".left-aside.sidebar-modal",
        { id: "left-aside" },
        m(NavMenu, { routes, mdl })
      )
  }
}
export default LeftAside
