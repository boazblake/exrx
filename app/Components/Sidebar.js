import m from "mithril"
import { animateSidebarEntrance } from "Utils"

const Sidebar = {
  oncreate: animateSidebarEntrance,
  view: ({ children, attrs: { classList } }) =>
    m(`aside.${classList}`, children)
}

export default Sidebar
