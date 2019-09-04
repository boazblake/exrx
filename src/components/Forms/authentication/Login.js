import m from 'mithril'

export const Login = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m('form.column', [
        m('.form-group', [
          m('label.form-label text-left', { for: 'email' }, 'Email'),
          m('input.form-input', {
            id: 'email',
            type: 'email',
            placeholder: 'Email',
            onkeyup: (e) => mdl.email(e.target.value),
            value: mdl.email(),
          }),
        ]),
        m('.form-group', [
          m('label.form-label text-left', { for: 'password' }, 'Password'),
          m('input.form-input', {
            id: 'password',
            type: 'password',
            placeholder: 'Password',
            onkeyup: (e) => mdl.password(e.target.value),
            value: mdl.password(),
          }),
        ]),
      ]),
  }
}
