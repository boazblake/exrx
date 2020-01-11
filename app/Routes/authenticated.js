import { ProfileLayout } from "../Layouts/index.js"
import Default from "../Pages/Default"
import ManageUsers from "../Pages/Admin/ManageUsers.js"
import { scrollToAnchor } from "Utils"
import Icons from "Components/Icons"

const authenticated = [
  {
    id: "profile-page",
    title: "Profile Page",
    icon: Icons.home,
    route: "/profile/:name",
    position: [],
    group: ["authenticated", "all", "client"],
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
    id: "manage-users",
    title: "Manage Users",
    icon: Icons.users,
    route: "/admin/user-management",
    position: [],
    group: ["authenticated", "admin"],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      console.log(
        "manage users on match",
        mdl,
        args,
        path,
        fullroute,
        isAnchor,
        mdl.state.isAuth(),
        mdl.user.isAdmin
      )
      !mdl.user.isAdmin && m.route.set(m.route.get())
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(ProfileLayout, { mdl }, m(ManageUsers, { mdl }))
  }
]

export default authenticated
