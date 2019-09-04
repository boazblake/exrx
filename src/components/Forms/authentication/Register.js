import m from 'mithril'

export const Register = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m('form.column', { role: 'form' }, [
        m('.form-group ', [
          m('label.form-label text-left', { for: 'reg-name' }, 'Name'),
          m('input.form-input', {
            id: 'reg-name',
            type: 'text',
            placeholder: 'Name',
            onkeyup: (e) => mdl.name(e.target.value),
            value: mdl.name(),
          }),
        ]),
        m('.form-group', [
          m('label.form-label text-left', { for: 'reg-email' }, 'Email'),
          m('input.form-input', {
            id: 'reg-email',
            type: 'email',
            placeholder: 'Email',
            onkeyup: (e) => mdl.email(e.target.value),
            value: mdl.email(),
          }),
        ]),
        m('.form-group', [
          m(
            'label.form-label text-left',
            { for: 'confirmEmail' },
            'Confirm Email'
          ),
          m('input.form-input', {
            id: 'confirmEmail',
            type: 'email',
            placeholder: 'Email',
            onkeyup: (e) => mdl.confirmEmail(e.target.value),
            value: mdl.confirmEmail(),
          }),
        ]),
        m('.form-group', [
          m('label.form-label text-left', { for: 'reg-pass' }, 'Password'),
          m('input.form-input', {
            id: 'reg-pass',
            type: 'password',
            placeholder: 'must contain and not contain',
            onkeyup: (e) => mdl.password(e.target.value),
            value: mdl.password(),
          }),
        ]),
        m('.form-group', [
          m(
            'label.form-label text-left',
            { for: 'pass-confirm' },
            'Confirm Password'
          ),
          m('input.form-input', {
            id: 'pass-confirm',
            type: 'password',
            placeholder: 'must contain and not contain',
            onkeyup: (e) => mdl.confirmPassword(e.target.value),
            value: mdl.confirmPassword(),
          }),
        ]),
      ]),
  }
}
