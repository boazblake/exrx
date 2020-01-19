import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClientForm from "./registerClientForm.js"
import { validateClientRegistrationTask } from "./Validations.js"
import { jsonCopy } from "Utils"
import Button from "Components/Button"
import { saveClient } from "../fns.js"

const dataModel = {
  firstname: "",
  lastname: "",
  email: "",
  confirmEmail: "",
  birthdate: ""
}

const state = {
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: jsonCopy(dataModel)
}

const resetState = () => {
  state.data = []
  state.errors = {}
  state.httpError = undefined
  state.isSubmitted = false
}

const validateForm = (mdl) => (data) => {
  const onError = (errs) => {
    state.errors = errs
    console.log("failed - state", state)
  }

  const onSuccess = (mdl) => ({ createClient }) => {
    mdl.clients.push(createClient)
    mdl.toggle(mdl, "AddClient")
    resetState()
  }

  state.isSubmitted = true
  validateClientRegistrationTask(data)
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
        action: () => validateForm(mdl)(state.data),
        label: "Add New Client",
        classList: "input btn btn-primary authBtn"
      })
    ]
  }
}

const AddClient = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(".", [
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
              isSubmitted: state.isSubmitted
            }),
            footer: m(AddClientActions, { mdl, state })
          })
      ])
  }
}

export default AddClient
