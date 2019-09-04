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

const validateData = (data) => {
  const onErr = (errs) => {
    state.errors = errs
    console.log('failed - state', state)
  }
  const onSucc = (data) => {
    console.log('validation success', data)
  }

  state.page
    ? validateLoginTask(data).fork(onErr, onSucc)
    : validateRegistrationTask(data).fork(onErr, onSucc)
}

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
            { onclick: () => validateData(state.data) },
            'Submit'
          ),
          m(AuthLinkButton, {
            mdl,
            title: state.title[state.page],
          }),
        ],
      }),
    ],
  }
}

export default AuthComponent
