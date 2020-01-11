import SplashLayout from "Layouts/SplashLayout"
import Default from "../Pages/Default"
import Home from "../Pages/Home"
import { scrollToAnchor } from "Utils"
import Icons from "Components/Icons"

const Main = [
  {
    id: "home",
    title: "Home",
    icon: Icons.logo,
    route: "/home",
    position: ["nav"],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(SplashLayout, { mdl }, m(Home, { mdl }))
  },
  {
    id: "about",
    title: "About",
    icon: "about",
    route: "/about",
    position: ["nav"],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(SplashLayout, { mdl }, m(Default, { mdl }))
  },
  {
    id: "contact",
    title: "Contact",
    icon: Icons.contact,
    route: "/contact",
    position: ["nav", "footer"],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(SplashLayout, { mdl }, m(Default, { mdl }))
  },
  {
    id: "blog",
    title: "Blog",
    icon: "blog",
    route: "/blog",
    position: ["nav", "footer"],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(SplashLayout, { mdl }, m(Default, { mdl }))
  }
]

export default Main
