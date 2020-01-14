import {
  Login,
  Register,
  validateLoginTask,
  validateUserRegistrationTask
} from "../../Forms/index.js"
import Modal from "../Modal.js"
import { jsonCopy } from "Utils"

const userModel = {
  name: "",
  email: "",
  password: "",
  confirmEmail: "",
  confirmPassword: "",
  isAdmin: false
}

const dataModel = { userModel }

const state = {
  forms: { 1: Register, 0: Login },
  page: 0,
  title: {
    1: "Register",
    0: "Login"
  },
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
  state.page = 0
}

const onError = (error) => {
  console.log("error with http calll", error)
  state.httpError = error.message
  state.isSubmitted = false
}

const onRegisterSuccess = (data) => {
  console.log("succes with registering", data, state)
  return (state.page = 0)
}

const onLoginSuccess = (mdl) => (user) => {
  window.sessionStorage.setItem("user-token", user["user-token"])
  mdl.user = user
  mdl.state.isAuth(true)
  mdl.toggleAuthModal(mdl)
  m.route.set(`/EXRX/${mdl.user.name}/dashboard`)
  resetState()
}

const validateForm = (mdl) => (data) => {
  const onValidationError = (errs) => {
    state.errors = errs
    console.log("failed - state", state)
  }

  const onValidationSuccess = (data) => {
    state.errors = {}
    state.page
      ? registerUser(mdl)(data).fork(onError, onRegisterSuccess)
      : loginUser(mdl)(data).fork(onError, onLoginSuccess(mdl))
  }
  state.isSubmitted = true
  state.page
    ? validateUserRegistrationTask(data.userModel).fork(
        onValidationError,
        onValidationSuccess
      )
    : validateLoginTask(data.userModel).fork(
        onValidationError,
        onValidationSuccess
      )
}

const loginUser = (mdl) => ({ email, password }) =>
  mdl.http.backEnd.postTask(mdl)("users/login")({
    login: email,
    password: password
  })

const registerUser = (mdl) => ({ name, email, password, isAdmin }) =>
  mdl.http.backEnd.postTask(mdl)("users/register")({
    name,
    email,
    password,
    isAdmin
  })

const changePage = () => {
  state.httpError = undefined
  return state.page ? (state.page = 0) : (state.page = 1)
}

const AuthLink = () => {
  return {
    view: ({ attrs: { title } }) =>
      m(
        "a.AuthLinkBtn btn-link",
        {
          onclick: changePage
        },
        title
      )
  }
}

const AuthComponent = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(Modal, {
        classList: "auth-modal",
        isActive: mdl.state.showAuthModal(),
        close: () => {
          resetState()
          mdl.toggleAuthModal(mdl)
        },
        title: state.title[state.page],
        content: m(state.forms[state.page], {
          data: state.data,
          errors: state.errors,
          httpError: state.httpError,
          isSubmitted: state.isSubmitted
        }),
        footer: [
          m(
            "input.btn.btn-primary authBtn",
            {
              type: "submit",
              form: `${state.title[state.page]}-form`,
              onclick: () => validateForm(mdl)(state.data),
              class: mdl.state.isLoading() && "loading"
            },
            state.title[state.page]
          ),
          m(AuthLink, {
            mdl,
            title: state.page ? "Login" : "Register"
          })
        ]
      })
  }
}

export default AuthComponent
