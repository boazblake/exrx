import m from 'mithril'
import {
  Login,
  Register,
  validateLoginTask,
  validateRegistrationTask,
} from '../../Forms/index.js'
import Modal from '../Modal.js'
import { jsonCopy } from 'utils'

const initState = {
  name: '',
  email: '',
  password: '',
  confirmEmail: '',
  confirmPassword: '',
}

const state = {
  forms: { 0: Register, 1: Login },
  page: 0,
  title: {
    0: 'Register',
    1: 'Login',
  },
  isSubmitted: false,
  errors: {},
  data: jsonCopy(initState),
}

const onRegisterError = (error) => console.log('error with registering', error)
const onRegisterSuccess = (mdl) => (data) => {
  state.page = 1

  console.log('succes with registering', data, mdl)
}
const onLoginError = (error) => console.log('error with login', error)

const onLoginSuccess = (mdl) => (user) => {
  window.sessionStorage.setItem('user-token', user['user-token'])
  mdl.user = user
  mdl.state.isAuth(true)
  mdl.toggleAuthModal(mdl)
  state.data = jsonCopy(initState)
}

const validateForm = (mdl) => (data) => {
  const onValidationError = (errs) => {
    state.errors = errs
    console.log('failed - state', state)
  }

  const onValidationSuccess = (data) => {
    state.errors = {}
    state.page
      ? loginUser(mdl)(data).fork(onLoginError, onLoginSuccess(mdl))
      : registerUser(mdl)(data).fork(
        onRegisterError(mdl),
        onRegisterSuccess(mdl)
      )
  }

  state.isSubmitted = true
  state.page
    ? validateLoginTask(data).fork(onValidationError, onValidationSuccess)
    : validateRegistrationTask(data).fork(
      onValidationError,
      onValidationSuccess
    )
}

const loginUser = (mdl) => (dto) =>
  mdl.http.postTask(mdl)('users/login')({
    dto: { login: dto.email, password: dto.password },
  })

const registerUser = (mdl) => (dto) =>
  mdl.http.postTask(mdl)('users/register')({ dto })

const AuthLinkButton = () => {
  return {
    view: ({ attrs: { title } }) =>
      m(
        'a',
        {
          class: 'btn-link',
          onclick: () => (state.page ? (state.page = 0) : (state.page = 1)),
        },
        title
      ),
  }
}

const AuthComponent = () => {
  return {
    view: ({ attrs: { mdl } }) => [
      m(Modal, {
        isActive: mdl.state.showAuthModal(),
        close: () => mdl.toggleAuthModal(mdl),
        title: state.title[state.page],
        content: m(state.forms[state.page], {
          data: state.data,
          errors: state.errors,
          isSubmitted: state.isSubmitted,
        }),
        footer: [
          m(
            'button.btn.btn-primary',
            { onclick: () => validateForm(mdl)(state.data) },
            state.title[state.page]
          ),
          m(AuthLinkButton, {
            mdl,
            title: state.page ? 'Register' : 'Login',
          }),
        ],
      }),
    ],
  }
}

export default AuthComponent
