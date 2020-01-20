import { validateLoginTask, validateUserRegistrationTask } from "./forms"
import {
  state,
  resetState,
  loginUserTask,
  changePage,
  registerUserTask
} from "./fns.js"
import Modal from "Components/Modal.js"
import Button from "Components/Button.js"

const validateForm = (state) => {
  const onError = (state) => (errs) => (state.errors = errs)

  const onSuccess = (state) => (_) => (state.errors = {})

  state.isSubmitted = true
  state.page
    ? validateUserRegistrationTask(state.data).fork(
        onError(state),
        onSuccess(state)
      )
    : validateLoginTask(state.data).fork(onError(state), onSuccess(state))
}

const saveForm = (mdl) => (state) => {
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
    resetState(state)
  }

  const onError = (errs) => {
    state.httpError = errs.message

    console.log("failed", state)
  }

  state.isSubmitted = true
  state.page
    ? validateUserRegistrationTask(state.data)
        .chain(registerUserTask(mdl))
        .fork(onError, onRegisterSuccess)
    : validateLoginTask(state.data)
        .chain(loginUserTask(mdl))
        .fork(onError, onLoginSuccess(mdl))
}

const AuthLink = () => {
  return {
    view: ({ attrs: { title } }) =>
      m(
        "a.authLinkBtn btn-link",
        {
          onclick: (e) => changePage(state)
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
          resetState(state)
          mdl.toggleAuthModal(mdl)
        },
        title: state.title[state.page],
        content: m(state.forms[state.page], {
          data: state.data,
          errors: state.errors,
          httpError: state.httpError,
          isSubmitted: state.isSubmitted,
          validate: () => validateForm(state)
        }),
        footer: [
          m(Button, {
            mdl,
            type: "submit",
            for: `${state.title[state.page]}-form`,
            action: () => saveForm(mdl)(state),
            label: state.title[state.page],
            classList: "input btn btn-primary authBtn"
          }),

          m(AuthLink, {
            mdl,
            title: state.page ? "Login" : "Register"
          })
        ]
      })
  }
}

export default AuthComponent
