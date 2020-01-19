import M from "moment"
import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClientForm from "./registerClientForm.js"
import { validateClientRegistrationTask } from "./Validations.js"
import { jsonCopy } from "Utils"
import Button from "Components/Button"
import { editClient, formState, resetForm } from "../fns.js"

let state = jsonCopy(formState)

const validateForm = (mdl) => (data) => {
  const onError = (mdl) => (errs) => {
    mdl.toggleToast(mdl)
    mdl.state.toast.contents(errs)
    mdl.state.toast.class("warn")
    state.errors = errs
    console.log("failed - state", errs)
  }

  const onSuccess = (mdl) => ({ editClient }) => {
    mdl.clients.push(editClient)
    mdl.toggle(mdl, `EditClient-${editClient.id}`)
    resetForm(state)
  }

  state.isSubmitted = true
  // console.log("submitting", data)
  validateClientRegistrationTask(data)
    .chain(editClient(mdl))
    .fork(onError(mdl), onSuccess(mdl))
}

const EditClientActions = () => {
  return {
    view: ({ attrs: { mdl, state } }) => [
      m(Button, {
        mdl,
        type: "submit",
        for: `client-form`,
        action: () => validateForm(mdl)(state.data),
        label: "Update Client",
        classList: "input btn btn-primary authBtn"
      })
    ]
  }
}

const EditClient = () => {
  return {
    view: ({ attrs: { mdl, client } }) =>
      m(".", [
        m(
          "button.btn",
          {
            onclick: (e) => {
              client.birthdate = M(client.birthdate).format("YYYY-MM-DD")
              state.data = { ...client, confirmEmail: client.email }
              mdl.toggle(mdl, `EditClient-${client.id}`)
            }
          },
          "Edit Client"
        ),
        mdl.toggles[`EditClient-${client.id}`] &&
          m(Modal, {
            animateEntrance: animateComponentEntrance,
            animateExit: slideModalOut,
            mdl,
            classList: "",
            isActive: mdl.toggles[`EditClient-${client.id}`](),
            close: () => mdl.toggle(mdl, `EditClient-${client.id}`),
            title: "Edit Client",
            content: m(RegisterClientForm, {
              data: state.data,
              errors: state.errors,
              httpError: state.httpError,
              isSubmitted: state.isSubmitted
            }),
            footer: m(EditClientActions, { mdl, state })
          })
      ])
  }
}

export default EditClient
