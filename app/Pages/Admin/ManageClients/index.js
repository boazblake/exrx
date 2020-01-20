import AddClient from "./AddClientModal"
import ClientCard from "./ClientCard.js"
import SortClients from "./SortClients.js"
import {
  loadClients,
  clientProps,
  clientPageState,
  filterClientsBy
} from "./fns.js"

const ManageClients = () => {
  return {
    oninit: loadClients,
    view: ({ attrs: { mdl } }) => {
      let clients = mdl.clients
      let props = clientProps
      return m(".contents", { id: "content" }, [
        m("section.section", { id: "content-toolbar" }, [
          m(AddClient, { mdl }),
          m(SortClients, {
            list: clients,
            props,
            state: clientPageState,
            sort: filterClientsBy
          })
        ]),
        m("section.section", { id: "content-data" }, [
          m(".manageClients", { id: mdl.state.route.id }, [
            m("section.panel.client-panel", [
              m(".panel-header", m("h1.panel-title", mdl.state.route.title)),
              m(
                ".panel-body",
                clients.map((client) =>
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
