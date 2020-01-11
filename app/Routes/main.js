import MainLayout from "Layouts/MainLayout"
import SplashLayout from "Layouts/SplashLayout"
import Default from "../Pages/Default"
import Home from "../Pages/Home"
import { scrollToAnchor } from "Utils"
import Icons from "Components/Icons"

const Main = [
  {
    id: "home",
    title: "Home",
    icon: Icons.home,
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
    id: "services",
    title: "Services",
    icon: Icons.services,
    route: "/services",
    position: ["nav", "sidebar"],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
  },
  {
    id: "discounts",
    title: "Discounts",
    icon: "discounts",
    route: "/discounts",
    position: ["nav", "footer"],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
      if (!mdl.state.isAuth()) return m.route.SKIP
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
  },
  {
    id: "vendors",
    title: "Vendors",
    icon: "vendors",
    route: "/vendors",
    position: ["nav", "footer"],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
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
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
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
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
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
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl }))
  }
]

export default Main
