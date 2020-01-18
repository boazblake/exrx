import ProfileLayout from "Layouts/ProfileLayout"
import Dashboard from "Pages/Admin/Dashboard"
import Default from "Pages/Default"
import ManageClients from "Pages/Admin/ManageClients"
import ManageNetwork from "Pages/Admin/ManageNetwork"
import BatteryTestConfig from "Pages/Admin/BatteryConfig"
import { scrollToAnchor } from "Utils"
import Icons from "Components/Icons"

const authenticated = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Icons.logo,
    route: "/EXRX/:name/dashboard",
    position: ["auth-nav", "left-aside"],
    group: ["authenticated"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(ProfileLayout, { mdl }, m(Dashboard, { mdl }))
  },
  {
    id: "profile-page",
    title: "Profile Page",
    icon: Icons.home,
    route: "/EXRX/:name/profile",
    position: ["settings-nav"],
    group: ["authenticated"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      console.log(
        "profile page login on match",
        mdl,
        args,
        path,
        fullroute,
        isAnchor,
        !mdl.state.isAuth()
      )
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(ProfileLayout, { mdl }, m(Default, { mdl }))
  },
  {
    id: "battery-config",
    title: "Battery Tests",
    icon: Icons.calcs,
    route: "/EXRX/:name/battery-config",
    position: ["left-aside"],
    group: ["authenticated", "admin"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      // console.log(
      //   "calcconfig",
      //   mdl,
      //   args,
      //   path,
      //   fullroute,
      //   isAnchor,
      //   mdl.state.isAuth(),
      //   mdl.user.isAdmin
      // )
      // !mdl.user.isAdmin && m.route.set(m.route.get())
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(ProfileLayout, { mdl }, m(BatteryTestConfig, { mdl }))
  },
  {
    id: "manage-clients",
    title: "Clients",
    icon: Icons.users,
    route: "/EXRX/:name/manage-clients",
    position: ["left-aside"],
    group: ["authenticated", "admin"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      // console.log(
      //   "manage users on match",
      //   mdl,
      //   args,
      //   path,
      //   fullroute,
      //   isAnchor,
      //   mdl.state.isAuth(),
      //   mdl.user.isAdmin
      // )
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(ProfileLayout, { mdl }, m(ManageClients, { mdl }))
  },
  {
    id: "manage-network",
    title: "Configure Network",
    icon: Icons.users,
    route: "/EXRX/:name/network-management",
    position: ["settings-nav"],
    group: ["authenticated", "admin"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      // console.log(
      //   "manage users on match",
      //   mdl,
      //   args,
      //   path,
      //   fullroute,
      //   isAnchor,
      //   mdl.state.isAuth(),
      //   mdl.user.isAdmin
      // )
      !mdl.user.isAdmin && m.route.set(m.route.get())
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(ProfileLayout, { mdl }, m(ManageNetwork, { mdl }))
  }
]

export default authenticated
