import AddClient from "./AddClientModal/index.js"

const ManageClients = () => {
  const loadClients = ({ attrs: { mdl } }) => {
    const onError = (e) => console.log("ERROR Fetching Clients", e)

    const onSuccess = ({ clients }) => (mdl.clients = clients)

    return mdl.http
      .postQl(mdl)(
        `query{
  clients(where:{trainer:{userId:${JSON.stringify(
    mdl.user.objectId
  )}}}){id, firstname, lastname}
}`
      )
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
                m(
                  "ul",
                  m("li", m("code", client.lastname, ",", client.firstname))
                )
              )
            )
          ])
        ])
      ])
    }
  }
}

export default ManageClients
