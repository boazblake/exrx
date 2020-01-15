import AddClient from "./AddClientModal/index.js"

const ManageClients = () => {
  const state = {}

  const loadClients = ({ attrs: { mdl } }) => {
    console.log("fetching clients")
    const query = `query{
  clients(where:{trainer:{userId:${JSON.stringify(mdl.user.objectId)}}}){id}
}`

    const onError = (e) => {
      console.log("ERROR", e)
    }

    const onSuccess = ({ clients }) => {
      console.log("SUCCESSS", clients)
      mdl.clients = clients
    }

    return mdl.http
      .postQl(mdl)(query)
      .fork(onError, onSuccess)
  }

  return {
    oninit: loadClients,
    view: ({ attrs: { mdl } }) => {
      console.log("manageclients")
      return m(".content", [
        m("section.section", { id: "content-toolbar" }, [
          m(AddClient, { mdl })
        ]),
        m("section.section", { id: "content-data" }, [
          m(".manageClients", { id: mdl.state.route.id }, [
            m("h1.title", mdl.state.route.title),
            m(
              "section.section",
              mdl.clients.map((client) =>
                m("ul", m("li", m("code", "client Id:", client.id)))
              )
            )
          ])
        ])
      ])
    }
  }
}

export default ManageClients
