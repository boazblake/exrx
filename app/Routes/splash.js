import { MainLayout } from "../Layouts/index.js"
import Default from "../Pages/Default"
import { flatten } from "ramda"
import { scrollToAnchor } from "Utils"
import Icons from "Components/Icons"

const SubMenu = [
  {
    id: "home-route-call",
    title: "713.270.0474",
    icon: Icons.phone,
    route: "/contact",
    position: [],
    group: ["home"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
  },
  {
    id: "home-route-brand",
    title: "BRAND",
    icon: "Assets/professional-auto-care-logo-brand.png",
    route: "/contact",
    position: [],
    group: ["home"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
  },
  {
    id: "home-route-address",
    title: "Professional Auto Care 9916 Honeywell St Houston TX 77074",
    icon: "address",
    route: "/contact",
    position: [],
    group: ["home"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
  }
]

const Splash = flatten([SubMenu])

export default Splash
