import ProfileLayout from "Layouts/ProfileLayout"
import Dashboard from "Pages/Admin/Dashboard"
import Default from "Pages/Default"
import ManageUsers from "Pages/Admin/ManageUsers"
import ManageClients from "Pages/Admin/ManageClients"
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
    title: "Configure Batteries",
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
    id: "manage-users",
    title: "Manage Users",
    icon: Icons.users,
    route: "/EXRX/:name/manage-users",
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
    component: (mdl) => m(ProfileLayout, { mdl }, m(ManageUsers, { mdl }))
  },
  {
    id: "manage-clients",
    title: "Manage Clients",
    icon: Icons.users,
    route: "/EXRX/:name/client-management",
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
    component: (mdl) => m(ProfileLayout, { mdl }, m(ManageClients, { mdl }))
  }
]

export default authenticated
