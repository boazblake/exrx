import m from 'mithril'

const LoginRegister = () => {
  return {
    view: () =>
      m(
        '.dropdown dropdown-right',
        m('.btn-group', [
          m('a.btn.btn-primary.dropdown-toggle[tabindex=\'0\']', [
            'Login / Register',
            m('i.icon.icon-caret'),
          ]),
          m('ul.menu', [
            m(
              'li.menu-item',
              m(m.route.Link, { class: 'btn-link', href: '#' }, 'login')
            ),
            m(
              'li.menu-item',
              m(m.route.Link, { class: 'btn-link', href: '#' }, 'register')
            ),
          ]),
        ])
      ),
  }
}

export default LoginRegister
