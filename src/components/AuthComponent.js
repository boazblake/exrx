import m from 'mithril'
import { Login, Register, validationsTask } from './forms/index.js'
import Modal from './Modal.js'
import Stream from 'mithril-stream'

const state = {
  forms: { 0: Register, 1: Login },
  page: 0,
  title: {
    0: 'Register',
    1: 'Login',
  },
  errors: {},
  mdl: {
    name: Stream(''),
    email: Stream(''),
    password: Stream(''),
    confirmEmail: Stream(''),
    confirmPassword: Stream(''),
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

  validationsTask(data).fork(onErr, onSucc)
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

const AuthComponent = ({ attrs: { mdl } }) => {
  console.log('MODEL', mdl)
  return {
    view: ({ attrs: { mdl } }) => [
      m(Modal, {
        isActive: mdl.state.showAuthModal(),
        close: () => mdl.toggleAuthModal(mdl),
        title: state.title[state.page],
        content: m(state.forms[state.page], { mdl: state.mdl }),
        footer: [
          m(
            'button.btn.btn-primary',
            { onclick: () => validateData(state.mdl) },
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
