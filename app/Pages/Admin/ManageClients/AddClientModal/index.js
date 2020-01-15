import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClientForm from "./registerClientForm.js"
import { validateClientRegistrationTask } from "./Validations.js"
import { jsonCopy } from "Utils"

const dataModel = {
  firstName: "",
  lastName: "",
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
  state.data = jsonCopy(dataModel)
  state.errors = {}
  state.httpError = undefined
  state.isSubmitted = false
}

const saveClient = (mdl) => ({ email, firstName, lastName, birthdate }) => {
  const query = `mutation {
  createClient(data: {email:${email}, firstname:${firstName}, lastname:${lastName}, birthdate:${birthdate} }) {
    id
  }
}`

  const onError = (e) => {
    console.log("ERROR", e)
  }

  const onSuccess = (s) => {
    console.log("SUCCESSS", s)
    state.clients = s
  }

  console.log("the Q", query)
  return mdl.http
    .postQl(mdl)(query)
    .fork(onError, onSuccess)
}

const validateForm = (mdl) => (data) => {
  const onValidationError = (errs) => {
    state.errors = errs
    console.log("failed - state", state)
  }

  const onValidationSuccess = (data) => {
    state.errors = {}
    saveClient(mdl)(data).fork(onError, onRegisterSuccess)
  }
  state.isSubmitted = true
  validateClientRegistrationTask(data).fork(
    onValidationError,
    onValidationSuccess
  )
}

const AddClientActions = () => {
  return {
    view: ({ attrs: { mdl, state } }) => [
      m(
        "input.btn.btn-primary authBtn",
        {
          type: "submit",
          form: `client-form`,
          onclick: () => {
            console.log(state)
            validateForm(mdl)(state.data)
          },
          class: mdl.state.isLoading() && "loading"
        },
        "Add New Client"
      )
    ]
  }
}

const AddClient = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(".", [
        m(
          "button.btn",
          { onclick: (e) => mdl.state.showModal(true) },
          "Add Client"
        ),
        m(Modal, {
          animateEntrance: animateComponentEntrance,
          animateExit: slideModalOut,
          mdl,
          classList: "",
          isActive: mdl.state.showModal(),
          close: () => mdl.state.showModal(false),
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
