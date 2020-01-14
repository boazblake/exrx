const ManageUsers = () => {
  const state = {}

  const loadUsers = ({ attrs: { mdl } }) => {
    const query = `query {
  user(where:{clientId: ${mdl.user.objectId}}){clients{id}}
}`

    const onError = (e) => {
      console.log("ERROR", e)
    }

    const onSuccess = (s) => {
      console.log("SUCCESSS", s)
      state.clients = s
    }

    console.log("the Q", query)
    return mdl.http
      .postQl(mdl)(query)
      .fork(onError, onSuccess)
  }

  return {
    oninit: loadUsers,
    view: ({ attrs: { mdl } }) =>
      m(".manageUsers", { id: mdl.state.route.id }, [
        m("h1.title", mdl.state.route.title)
      ])
  }
}

export default ManageUsers
