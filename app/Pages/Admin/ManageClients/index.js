import AddClient from "./AddClientModal"
import ClientCard from "./ClientCard.js"
import { loadClients } from "./fns.js"

const ManageClients = () => {
  return {
    oninit: loadClients,
    view: ({ attrs: { mdl } }) => {
      return m(".contents", { id: "content" }, [
        m("section.section", { id: "content-toolbar" }, [
          m(AddClient, { mdl })
        ]),
        m("section.section", { id: "content-data" }, [
          m(".manageClients", { id: mdl.state.route.id }, [
            m("section.panel.client-panel", [
              m(".panel-header", m("h1.panel-title", mdl.state.route.title)),
              m(
                ".panel-body",
                mdl.clients.map((client) =>
                  m(ClientCard, { key: client.id, mdl, client })
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
