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
  const init = ({ attrs: { mdl } }) => loadClients(mdl)

  return {
    oninit: init,
    view: ({ attrs: { mdl } }) => {
      let clients = filterClientsBy(clientPageState)(mdl.clients)
      return m(".contents", { id: "content" }, [
        m("section.section", { id: "content-toolbar" }, [
          m(AddClient, { mdl }),
          m(SortClients, {
            list: mdl.clients,
            props: clientProps,
            state: clientPageState,
            sort: filterClientsBy(clientPageState)
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
