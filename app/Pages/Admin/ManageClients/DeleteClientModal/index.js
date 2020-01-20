import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import Button from "Components/Button"
import { deleteClient } from "../fns.js"

const DeleteClientActions = () => {
  return {
    view: ({ attrs: { mdl, client } }) => [
      m(Button, {
        mdl,
        type: "submit",
        for: `client-form`,
        action: () => deleteClient(mdl)(client.id),
        label: "Delete Client",
        classList: "input btn btn-error authBtn"
      })
    ]
  }
}

const DeleteClient = () => {
  return {
    view: ({ attrs: { mdl, client } }) =>
      m("section.deleteClient", [
        m(
          "button.btn btn-error",
          { onclick: (e) => mdl.toggle(mdl, "deleteClient") },
          "Delete Client"
        ),
        mdl.toggles["deleteClient"] &&
          m(Modal, {
            animateEntrance: animateComponentEntrance,
            animateExit: slideModalOut,
            mdl,
            classList: "",
            isActive: mdl.toggles["deleteClient"](),
            close: () => mdl.toggle(mdl, "deleteClient"),
            title: `Delete Client: ${client.firstname} ${client.lastname}`,
            content: m(
              "p.error",
              `WARNING proceding will remove ${client.firstname} ${client.lastname} and all associated Data.`
            ),
            footer: m(DeleteClientActions, { mdl, client })
          })
      ])
  }
}

export default DeleteClient
