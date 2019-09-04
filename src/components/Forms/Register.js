import m from 'mithril'

export const Register = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m('div', { class: 'column col-6 col-xs-12' }, [
        m('div', { class: 'form-group' }, [
          m('label', { class: 'form-label', for: 'reg-name' }, 'Name'),
          m('input', {
            class: 'form-input',
            id: 'reg-name',
            type: 'text',
            placeholder: 'Name',
            value: mdl.name,
          }),
        ]),
        m('div', { class: 'form-group' }, [
          m('label', { class: 'form-label', for: 'reg-email-1' }, 'Email'),
          m('input', {
            class: 'form-input',
            id: 'reg-email-1',
            type: 'email',
            placeholder: 'Email',
            value: mdl.email,
          }),
        ]),
        m('div', { class: 'form-group' }, [
          m(
            'label',
            { class: 'form-label', for: 'reg-email-2' },
            'Confirm Email'
          ),
          m('input', {
            class: 'form-input',
            id: 'reg-email-2',
            type: 'email',
            placeholder: 'Email',
            value: mdl.confirmemail,
          }),
        ]),
        m('div', { class: 'form-group' }, [
          m('label', { class: 'form-label', for: 'reg-pass' }, 'Password'),
          m('input', {
            class: 'form-input',
            id: 'reg-pass',
            type: 'password',
            placeholder: 'must contain and not contain',
            value: mdl.password,
          }),
        ]),
      ]),
  }
}
