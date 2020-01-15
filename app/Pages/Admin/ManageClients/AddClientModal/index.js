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

const saveClientTask = (mdl) => ({ email, firstName, lastName, birthdate }) => {
  const query = `mutation {
  createClient(
    data: {
      email:${JSON.stringify(email)},
      firstname:${JSON.stringify(firstName)},
      lastname:${JSON.stringify(lastName)},
      birthdate:${JSON.stringify(birthdate)},
      trainer:{connect:{userId: ${JSON.stringify(mdl.user.objectId)}}}
    }), {
    id
  }
}`

  return mdl.http.postQl(mdl)(query)
}

const validateForm = (mdl) => (data) => {
  const onError = (errs) => {
    state.errors = errs
    console.log("failed - state", state)
  }

  const onSuccess = (mdl) => ({ createClient }) => {
    console.log("data", data)
    mdl.clients.push(createClient)
    mdl.toggleModal(mdl)
    state.errors = {}
  }

  state.isSubmitted = true
  validateClientRegistrationTask(data)
    .chain(saveClientTask(mdl))
    .fork(onError, onSuccess(mdl))
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
            // console.log(state)
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
        m("button.btn", { onclick: (e) => mdl.toggleModal(mdl) }, "Add Client"),
        m(Modal, {
          onremove: (v) => console.log("who am i??", v),
          animateEntrance: animateComponentEntrance,
          animateExit: slideModalOut,
          mdl,
          classList: "",
          isActive: mdl.state.showModal(),
          close: () => mdl.toggleModal(mdl),
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
