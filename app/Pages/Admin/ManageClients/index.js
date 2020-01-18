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
  )}}}){id, firstname, lastname, email, birthdate}
}`
      )
      .fork(onError, onSuccess)
  }

  return {
    oninit: loadClients,
    view: ({ attrs: { mdl } }) => {
      return m(".contents", { id: "content" }, [
        m("section.section", { id: "content-toolbar" }, [
          m(AddClient, { mdl })
        ]),
        m("section.section", { id: "content-data" }, [
          m(".manageClients", { id: mdl.state.route.id }, [
            m("section.panel", [
              m(".panel-header", m("h1.panel-title", mdl.state.route.title)),
              m(
                ".panel-body",
                mdl.clients.map((client) =>
                  m(".panel-item.card", [
                    m(
                      ".tile-icon",
                      m("figure.avatar", {
                        "data-initial": `${client.firstname[0]}${client.lastname[0]}`
                      })
                    ),
                    m(
                      ".text.text-bold",
                      `${client.lastname}, ${client.firstname}`
                    )
                  ])
                )
              )
            ])
          ])
        ])
      ])
    }
  }
}

export default ManageClients
