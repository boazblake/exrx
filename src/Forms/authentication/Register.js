import m from 'mithril'

export const Register = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted, httpError } }) =>
      m('form.column', { role: 'form' }, [
        m(
          '.form-group ',
          isSubmitted && { class: errors.name ? 'has-error' : 'has-success' },
          [
            m('label.form-label text-left', { for: 'reg-name' }, 'Name'),
            m('input.form-input', {
              id: 'reg-name',
              type: 'text',
              placeholder: 'Name',
              onkeyup: (e) => (data.name = e.target.value),
              value: data.name,
            }),
            errors.name && m('p.form-input-hint', errors.name),
          ]
        ),
        m(
          '.form-group',
          isSubmitted && { class: errors.email ? 'has-error' : 'has-success' },
          [
            m('label.form-label text-left', { for: 'reg-email' }, 'Email'),
            m('input.form-input', {
              id: 'reg-email',
              type: 'email',
              placeholder: 'Email',
              onkeyup: (e) => (data.email = e.target.value),
              value: data.email,
            }),
            errors.email && m('p.form-input-hint', errors.email),
          ]
        ),
        m(
          '.form-group',
          isSubmitted && {
            class: errors.confirmEmail ? 'has-error' : 'has-success',
          },
          [
            m(
              'label.form-label text-left',
              { for: 'confirmEmail' },
              'Confirm Email'
            ),
            m('input.form-input', {
              id: 'confirmEmail',
              type: 'email',
              placeholder: 'Email',
              onkeyup: (e) => (data.confirmEmail = e.target.value),
              value: data.confirmEmail,
            }),
            errors.confirmEmail && m('p.form-input-hint', errors.confirmEmail),
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
              onkeyup: (e) => (data.password = e.target.value),
              value: data.password,
            }),
            errors.password && m('p.form-input-hint', errors.password),
          ]
        ),
        m(
          '.form-group',
          isSubmitted && {
            class: errors.confirmPassword ? 'has-error' : 'has-success',
          },
          [
            m(
              'label.form-label text-left',
              { for: 'pass-confirm' },
              'Confirm Password'
            ),
            m('input.form-input', {
              id: 'pass-confirm',
              type: 'password',
              placeholder: 'must contain and not contain',
              onkeyup: (e) => (data.confirmPassword = e.target.value),
              value: data.confirmPassword,
            }),
            errors.confirmPassword &&
              m('p.form-input-hint', errors.confirmPassword),
          ]
        ),
        httpError && m('p', httpError),
      ]),
  }
}
