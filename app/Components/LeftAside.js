import NavMenu from "./Navigation/NavMenu.js"
import { animate } from "Utils/animations"

const LeftAside = ({ attrs: { mdl } }) => {
  let routes = mdl.Routes.filter((r) => r.position.includes("left-aside"))
  return {
    oncreate: animate("slide-right"),
    view: ({ attrs: { mdl } }) =>
      m(
        ".left-aside.slide-left",
        { id: "left-aside" },
        m(NavMenu, { routes, mdl })
      ),
    onbeforeremove: animate("slide-left")
  }
}
export default LeftAside
