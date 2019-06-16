import m from 'mithril'
import { animateSidebarEntrance } from '../utils/animations.js'

const Sidebar = {
  oncreate: animateSidebarEntrance,
  view: ({ children, attrs: { classList } }) =>
    m(`aside.sidebar-${classList} slide-${classList}`, children),
}

export default Sidebar
