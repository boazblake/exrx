import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClientForm from "../registerClientForm.js"
import { validateClientRegistrationTask } from "./Validations.js"
import Button from "Components/Button"
import { saveClient, formState, resetForm, loadClients } from "../fns.js"
import { jsonCopy } from "Utils"

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

  const onSuccess = (mdl) => ({ createClient }) => {
    mdl.toggle(mdl, "AddClient")
    resetForm(state)
    loadClients(mdl)
  }

  state.isSubmitted = true
  validateClientRegistrationTask(state.data)
    .chain(saveClient(mdl))
    .fork(onError, onSuccess(mdl))
}

const AddClientActions = () => {
  return {
    view: ({ attrs: { mdl, state } }) => [
      m(Button, {
        mdl,
        type: "submit",
        for: `client-form`,
        action: () => saveForm(mdl)(state),
        label: "Add New Client",
        classList: "input btn btn-primary authBtn"
      })
    ]
  }
}

const AddClient = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m("section.addClient", [
        m(
          "button.btn",
          { onclick: (e) => mdl.toggle(mdl, "AddClient") },
          "Add Client"
        ),
        mdl.toggles["AddClient"] &&
          m(Modal, {
            animateEntrance: animateComponentEntrance,
            animateExit: slideModalOut,
            mdl,
            classList: "",
            isActive: mdl.toggles["AddClient"](),
            close: () => mdl.toggle(mdl, "AddClient"),
            title: "Add Client",
            content: m(RegisterClientForm, {
              data: state.data,
              errors: state.errors,
              isSubmitted: state.isSubmitted,
              httpError: state.httpError,
              validate: () => validateForm(state)
            }),
            footer: m(AddClientActions, { mdl, state })
          })
      ])
  }
}

export default AddClient
