import m from 'mithril'
import {
  Login,
  Register,
  validateLoginTask,
  validateRegistrationTask,
} from '../../Forms/index.js'
import Modal from '../Modal.js'

const state = {
  forms: { 0: Register, 1: Login },
  page: 0,
  title: {
    0: 'Register',
    1: 'Login',
  },
  isSubmitted: false,
  errors: {},
  data: {
    name: '',
    email: '',
    password: '',
    confirmEmail: '',
    confirmPassword: '',
  },
}

const onRegisterError = (error) => console.log('error with registering', error)
const onRegisterSuccess = (data) => console.log('succes with registering', data)
const onLoginError = (error) => console.log('error with login', error)
const onLoginSuccess = (mdl) => (user) => {
  window.sessionStorage.setItem('user-token', user['user-token'])
  mdl.user = user
}

const validateForm = (mdl) => (data) => {
  const onValidationError = (errs) => {
    state.errors = errs
    console.log('failed - state', state)
  }

  const onValidationSuccess = (data) => {
    state.errors = {}
    console.log('validation success', data, state.page)
    state.page
      ? loginUser(mdl)(data).fork(onLoginError, onLoginSuccess(mdl))
      : registerUser(mdl)(data).fork(onRegisterError, onRegisterSuccess)
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
            'Submit'
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
