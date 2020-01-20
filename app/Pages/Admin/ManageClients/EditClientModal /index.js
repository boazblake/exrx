import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClientForm from "../registerClientForm.js"
import { validateClientRegistrationTask } from "./Validations.js"
import { jsonCopy } from "Utils"
import Button from "Components/Button"
import { editClient, formState, resetForm, loadClients } from "../fns.js"

let state = jsonCopy(formState)

const validateForm = (state) => {
  const onError = (state) => (errs) => (state.errors = errs)

  const onSuccess = (state) => (_) => (state.errors = {})

  state.isSubmitted = true
  validateClientRegistrationTask(state.data).fork(
    onError(state),
    onSuccess(state)
  )
}

const saveForm = (mdl) => (state) => {
  const onError = (errs) => {
    if (errs.HttpError) {
      state.httpError = errs.Errors
      state.errors = {}
    } else state.errors = errs

    console.log("failed save", state)
  }

  const onSuccess = (mdl) => ({ updateClient }) => {
    mdl.toggle(mdl, `EditClient-${updateClient.id}`)
    resetForm(state)
    loadClients({ attrs: { mdl } })
  }

  state.isSubmitted = true
  validateClientRegistrationTask(state.data)
    .chain(editClient(mdl))
    .fork(onError, onSuccess(mdl))
}

const EditClientActions = () => {
  return {
    view: ({ attrs: { mdl, state } }) => [
      m(Button, {
        mdl,
        type: "submit",
        for: `client-form`,
        action: () => saveForm(mdl)(state),
        label: "Update Client",
        classList: "input btn btn-primary authBtn"
      })
    ]
  }
}

const EditClient = () => {
  return {
    view: ({ attrs: { mdl, client } }) =>
      m("section.editClient", [
        m(
          "button.btn",
          {
            onclick: (e) => {
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
              isSubmitted: state.isSubmitted,
              validate: () => validateForm(state)
            }),
            footer: m(EditClientActions, { mdl, state })
          })
      ])
  }
}

export default EditClient
