import Button from "Components/Button"
import { SlideOutLeft } from "Styles/animations.js"
import { deleteClient } from "./fns.js"
import EditClient from "./EditClientModal "

const ClientCard = () => {
  return {
    onbeforeremove: SlideOutLeft,
    view: ({ attrs: { mdl, client } }) =>
      m(
        ".panel-item.card.client",
        m(".tile.tile-centered", [
          m(
            ".tile-icon",
            m("figure.avatar", {
              "data-initial": `${client.firstname[0]}${client.lastname[0]}`
            })
          ),
          m(
            ".tile-content",
            m(".text.text-bold", `${client.lastname}, ${client.firstname}`)
          ),
          m(
            ".dropdown dropdown-right",
            m(".btn-group", [
              m(
                "button.btn.btn-action.btn-lg.dropdown-toggle",
                { tabIndex: 0 },
                m("i.icon.icon-more-vert")
              ),
              m("ul.menu", { id: "client-menu" }, [
                m("li.menu-item", m(EditClient, { mdl, client })),
                m(
                  "li.menu-item",
                  m(Button, {
                    mdl,
                    action: (e) => deleteClient(mdl)(client.id),
                    label: "Delete",
                    classList: "",
                    isDisabled: false
                  })
                )
              ])
            ])
          )
        ])
      )
  }
}

export default ClientCard
