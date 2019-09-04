import m from 'mithril'
import { Login, Register } from './Forms/index.js'
import Modal from './Modal.js'

const state = {
  forms: { 0: Register, 1: Login },
  page: 0,
  mdl: {},
}

console.log()

const AuthButton = () => {
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
        title: state.page ? 'Login' : 'Register',
        content: m(state.forms[state.page], { mdl: state.mdl }),
        footer: m(AuthButton, {
          mdl,
          title: state.page ? 'Register' : 'Login',
        }),
      }),
    ],
  }
}

export default AuthComponent
