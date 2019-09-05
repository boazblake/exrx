import m from 'mithril'
import Stream from 'mithril-stream'

const Logout = () => {
  const onError = (mdl) => (error) => {
    console.log('error', error, mdl)
  }

  const onSuccess = (mdl) => (data) => {
    console.log('success', data, mdl)
    mdl.state.isAuth(false)
  }

  const logout = (mdl) =>
    mdl.http
      .getTask(mdl)('users/logout')
      .fork(onError(mdl), onSuccess(mdl))

  return {
    view: ({ attrs: { mdl } }) =>
      m(
        'li.menu-item',
        m('button.btn btn-primary', { onclick: () => logout(mdl) }, 'LOGOUT')
      ),
  }
}

const SettingsMenu = () => {
  return {
    showMenu: Stream(false),
    view: ({ state, attrs: { mdl } }) =>
      m(
        'button.btn btn-primary',
        { onclick: () => state.showMenu(!state.showMenu()) },
        [
          'User Settings',
          m('i.icon icon-arrow-down'),
          state.showMenu() &&
            m('ul.menu', [
              m(Logout, { mdl }),
              m('li.menu-item', 'b'),
              m('li.menu-item', 'c'),
            ]),
        ]
      ),
  }
}

export default SettingsMenu
