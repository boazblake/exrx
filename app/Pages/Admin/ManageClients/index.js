import AddClient from "./AddClientModal"
import ClientCard from "./ClientCard.js"
import SortClients from "./SortClients.js"
import Toolbar from "Components/Toolbar"
import {
  loadClients,
  clientProps,
  clientPageState,
  filterClientsBy
} from "./fns.js"

const ClientToolbar = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(Toolbar, {
        mdl,
        left: m(AddClient, { mdl }),
        right: [
          ,
          m(SortClients, {
            list: mdl.clients,
            props: clientProps,
            state: clientPageState,
            sort: filterClientsBy(clientPageState)
          }),
          m(
            "button.btn btn-sm",
            { onclick: () => clientPageState.isAsc(!clientPageState.isAsc()) },
            m(
              `i.icon ${
                clientPageState.isAsc() ? "icon-arrow-down" : "icon-arrow-up"
              }`
            )
          ),
          m(".has-icon-right", [
            m("input.form-input", {
              type: "text",
              oninput: (e) => clientPageState.term(e.target.value),
              placeholder: "Filter Clients"
            }),
            m("i.form-icon icon icon-search icon-sm")
          ])
        ]
      })
  }
}

const ManageClients = () => {
  const init = ({ attrs: { mdl } }) => loadClients(mdl)

  return {
    oninit: init,
    view: ({ attrs: { mdl } }) => {
      let clients = filterClientsBy(clientPageState)(mdl.clients)
      return m(".contents", { id: "content" }, [
        m(ClientToolbar, { mdl }),
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
