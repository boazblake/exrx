import AddClient from "./AddClientModal/index.js"

const ManageClients = () => {
  const state = {}

  const loadUsers = ({ attrs: { mdl } }) => {
    const query = `query{
  clients(where:{trainer:{userId:${JSON.stringify(mdl.user.objectId)}}}){id}
}`

    const onError = (e) => {
      console.log("ERROR", e)
    }

    const onSuccess = ({ clients }) => {
      console.log("SUCCESSS", clients)
      state.clients = clients
    }

    return mdl.http
      .postQl(mdl)(query)
      .fork(onError, onSuccess)
  }

  return {
    oninit: loadUsers,
    view: ({ attrs: { mdl } }) =>
      m(".content", [
        m("section.section", { id: "content-toolbar" }, [
          m(AddClient, { mdl })
        ]),
        m("section.section", { id: "content-data" }, [
          m(".manageClients", { id: mdl.state.route.id }, [
            m("h1.title", mdl.state.route.title)
          ])
        ])
      ])
  }
}

export default ManageClients
