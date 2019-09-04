import m from 'mithril'

export const Login = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m('div', { class: 'column col-6 col-xs-12' }, [
        m('div', { class: 'form-group' }, [
          m('label', { class: 'form-label', for: 'email' }, 'Email'),
          m('input', {
            class: 'form-input',
            id: 'email',
            type: 'email',
            placeholder: 'Email',
            value: mdl.email,
          }),
        ]),
        m('div', { class: 'form-group' }, [
          m('label', { class: 'form-label', for: 'password' }, 'Password'),
          m('input', {
            class: 'form-input',
            id: 'password',
            type: 'text',
            placeholder: 'Password',
            value: mdl.password,
          }),
        ]),
      ]),
  }
}
