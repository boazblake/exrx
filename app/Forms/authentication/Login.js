import m from 'mithril'

export const Login = () => {
  return {
    view: ({
      attrs: {
        data: { userModel },
        errors,
        isSubmitted,
        httpError,
      },
    }) =>
      m(
        'form.column',
        { role: 'form', id: 'Login-form', onsubmit: (e) => e.preventDefault() },
        [
          m(
            '.form-group',
            isSubmitted && {
              class: errors.email ? 'has-error' : 'has-success',
            },
            [
              m('label.form-label text-left', { for: 'reg-email' }, 'Email'),
              m('input.form-input', {
                id: 'reg-email',
                type: 'email',
                placeholder: 'Email',
                onkeyup: (e) => (userModel.email = e.target.value),
                value: userModel.email,
              }),
              errors.email && m('p.form-input-hint', errors.email),
            ]
          ),
          m(
            '.form-group',
            isSubmitted && {
              class: errors.password ? 'has-error' : 'has-success',
            },
            [
              m('label.form-label text-left', { for: 'reg-pass' }, 'Password'),
              m('input.form-input', {
                id: 'reg-pass',
                type: 'password',
                placeholder: 'must contain and not contain',
                onkeyup: (e) => (userModel.password = e.target.value),
                value: userModel.password,
              }),
              errors.password && m('p.form-input-hint', errors.password),
            ]
          ),
          httpError && m('.toast toast-error', httpError),
        ]
      ),
  }
}
