import m from 'mithril'

const RegisterUser = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted } }) =>
      m('.column col-6', [
        m(
          '.form-group ',
          isSubmitted && { class: errors.name ? 'has-error' : 'has-success' },
          [
            m('label.form-label text-left', { for: 'reg-name' }, [
              'Name',
              m('span.span required', '*'),
            ]),
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
            m('label.form-label text-left', { for: 'reg-email' }, [
              'Email',
              m('span.span required', '*'),
            ]),
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
            m('label.form-label text-left', { for: 'confirmEmail' }, [
              'Confirm Email',
              m('span.span required', '*'),
            ]),
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
            m('label.form-label text-left', { for: 'reg-pass' }, [
              'Password',
              m('span.span required', '*'),
            ]),
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
            m('label.form-label text-left', { for: 'pass-confirm' }, [
              'Confirm Password',
              m('span.span required', '*'),
            ]),
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
      ]),
  }
}

export default RegisterUser
