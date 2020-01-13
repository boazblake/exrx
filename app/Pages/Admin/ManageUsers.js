const ManageUsers = () => {
  const state = {}

  const loadUsers = ({ attrs: { mdl } }) => {
    const onError = (e) => {
      console.log("ERROR", e)
    }

    const onSuccess = (s) => {
      console.log("SUCCESSS", s)
      state.users = s
    }

    return mdl.http.backEnd
      .getTask(mdl)("data/users?pageSize=100")
      .fork(onError, onSuccess)
  }

  const updateAdminStatus = (mdl, user) => (e) => {
    const onError = (user) => (e) => {
      user.isAdmin = !user.isAdmin
      console.log("ERROR", e)
    }

    const onSuccess = (user) => (s) => {
      console.log("SUCCESSS", user)
    }

    console.log({ mdl, user })
    mdl.http.backEnd
      .putTask(mdl)(`data/Users/${user.objectId}`)({
        isAdmin: (user.isAdmin = !user.isAdmin)
      })
      .fork(onError(user), onSuccess(user))
  }

  return {
    oninit: loadUsers,
    view: ({ attrs: { mdl } }) =>
      m(".manageusers", { id: mdl.state.route.id }, [
        m("h1.title", mdl.state.route.title),

        state.users &&
          state.users.map((u) =>
            m(
              ".menu",
              m(".menu-item", [
                m("p", u.name),
                m("p", u.email),
                m(
                  ".form-group",
                  m("label.form-switch", [
                    m("input[type='checkbox']", {
                      checked: u.isAdmin,
                      onchange: updateAdminStatus(mdl, u),
                      isDisabled: false,
                      class: ""
                    }),
                    m("i.form-icon"),
                    "User is Admin"
                  ])
                )
              ])
            )
          )
      ])
  }
}

export default ManageUsers
