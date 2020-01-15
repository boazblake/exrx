import Modal from "Components/Modal"
import { animateComponentEntrance, slideModalOut } from "Utils/animations"
import RegisterClient from "./registerClientForm.js"
import { jsonCopy } from "Utils"

const clientModel = {
  firstname: "",
  lastname: "",
  email: "",
  birthday: ""
}

const dataModel = { clientModel }

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
            //  validateForm(mdl)(state.data)
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
          content: m(RegisterClient, {
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
