import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClientForm from "../registerClientForm.js"
import { validateClientRegistrationTask } from "./Validations.js"
import Button from "Components/Button"
import { saveClient, formState, resetForm } from "../fns.js"
import { jsonCopy } from "Utils"

let state = jsonCopy(formState)

const validateForm = (state) => {
  const onError = (errs) => {
    if (errs.HttpError) {
      state.httpError = errs.Errors
    } else state.errors = errs

    console.log("failed state", state)
  }

  const onSuccess = (data) => {
    state.errors = {}
    console.log("success", state, data)
  }

  state.isSubmitted = true
  validateClientRegistrationTask(state.data).fork(onError, onSuccess)
}

const saveForm = (mdl) => (state) => {
  const onError = (errs) => {
    if (errs.HttpError) {
      state.httpError = errs.Errors
      state.errors = {}
    } else state.errors = errs

    console.log("failed state", state)
  }

  const onSuccess = (mdl) => ({ createClient }) => {
    mdl.clients.push(createClient)
    mdl.toggle(mdl, "AddClient")
    resetForm(state)
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