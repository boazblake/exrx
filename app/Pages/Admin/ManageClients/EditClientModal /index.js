import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClientForm from "./registerClientForm.js"
import { validateClientRegistrationTask } from "./Validations.js"
import { jsonCopy } from "Utils"
import Button from "Components/Button"

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

const saveClientTask = (mdl) => ({ email, firstname, lastname, birthdate }) =>
  mdl.http.postQlTask(mdl)(`mutation {
  createClient(
    data: {
      email:${JSON.stringify(email)},
      firstname:${JSON.stringify(firstname)},
      lastname:${JSON.stringify(lastname)},
      birthdate:${JSON.stringify(birthdate)},
      trainer:{connect:{userId: ${JSON.stringify(mdl.user.objectId)}}}
    }), {id, firstname, lastname, email, birthdate}
}`)

const validateForm = (mdl) => (data) => {
  const onError = (errs) => {
    state.errors = errs
    console.log("failed - state", state)
  }

  const onSuccess = (mdl) => ({ createClient }) => {
    mdl.clients.push(createClient)
    mdl.toggleModal(mdl)
    resetState()
  }

  state.isSubmitted = true
  validateClientRegistrationTask(data)
    .chain(saveClientTask(mdl))
    .fork(onError, onSuccess(mdl))
}

const EditClientActions = () => {
  return {
    view: ({ attrs: { mdl, state } }) => [
      m(Button, {
        mdl,
        type: "submit",
        for: `client-form`,
        action: () => validateForm(mdl)(state.data),
        label: "Edit New Client",
        classList: "input btn btn-primary authBtn"
      })
    ]
  }
}

const EditClient = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(".", [
        m(
          "button.btn",
          { onclick: (e) => mdl.toggleModal(mdl) },
          "Edit Client"
        ),
        mdl.state.showModal() &&
          m(Modal, {
            animateEntrance: animateComponentEntrance,
            animateExit: slideModalOut,
            mdl,
            classList: "",
            isActive: mdl.state.showModal(),
            close: () => mdl.toggleModal(mdl),
            title: "Edit Client",
            content: m(RegisterClientForm, {
              data: state.data,
              errors: state.errors,
              isSubmitted: state.isSubmitted
            }),
            footer: m(EditClientActions, { mdl, state })
          })
      ])
  }
}

export default EditClient
