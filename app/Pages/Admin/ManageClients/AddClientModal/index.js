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

// let entries = Stream(1)

// const createForms = (length, state) =>
//   (state.data = Array.from(
//     [jsonCopy(dataModel)].fill.call({ length }, jsonCopy(dataModel))
//   ))

const state = {
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: []
}

const resetState = () => {
  state.data = []
  state.errors = {}
  state.httpError = undefined
  state.isSubmitted = false
  // state.entries(1)
}

const saveClientTask = (mdl) => ({ email, firstname, lastname, birthdate }) =>
  mdl.http.postQl(mdl)(`mutation {
  createClient(
    data: {
      email:${JSON.stringify(email)},
      firstname:${JSON.stringify(firstname)},
      lastname:${JSON.stringify(lastname)},
      birthdate:${JSON.stringify(birthdate)},
      trainer:{connect:{userId: ${JSON.stringify(mdl.user.objectId)}}}
    }), {id, firstname, lastname}
}`)

const validateForm = (mdl) => (data) => {
  console.log(mdl, data)
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

const AddClientActions = () => {
  return {
    view: ({ attrs: { mdl, clients } }) => [
      m(Button, {
        mdl,
        type: "submit",
        for: `client-form`,
        action: () => clients.map((state) => validateForm(mdl)(state.data)),
        label: "Add New Client",
        classList: "input btn btn-primary authBtn"
      })
    ]
  }
}

const AddClient = () => {
  let clients = [state]
  return {
    view: ({ attrs: { mdl } }) =>
      m(".", [
        m("button.btn", { onclick: (e) => mdl.toggleModal(mdl) }, "Add Client"),
        m(Modal, {
          animateEntrance: animateComponentEntrance,
          animateExit: slideModalOut,
          mdl,
          classList: "",
          isActive: mdl.state.showModal(),
          close: () => mdl.toggleModal(mdl),
          title: "Add Client",
          content: [
            m(
              "button.btn",
              {
                onclick: (e) => {
                  e.false
                  clients.push(jsonCopy(state))
                }
              },
              "Add Another Client"
            ),
            m("section.clientForms", [
              clients.map((client) =>
                m(RegisterClientForm, {
                  data: client.data,
                  errors: client.errors,
                  isSubmitted: client.isSubmitted
                })
              )
            ])
          ],
          footer: m(AddClientActions, { mdl, clients })
        })
      ])
  }
}

export default AddClient
