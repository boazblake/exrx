import m from 'mithril'
import Stream from 'mithril-stream'

const Logout = () => {
  const onError = (mdl) => (error) => {
    console.log('error', error, mdl)
  }

  const onSuccess = (mdl) => (data) => {
    console.log('success', data, mdl)
    window.sessionStorage.removeItem('user-token')
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

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active, mdl } }) =>
      m(
        'li.menu-item',
        m(
          m.route.Link,
          {
            class: active ? 'active menu-item' : 'menu-item',
            onclick: () => {
              m.route.set(tab.route, { a: tab.id })
              mdl.toggleNav(mdl)
            },
            key,
            id: `${tab.id}-key`,
            href: `${tab.route}`,
          },
          tab.title
        )
      ),
  }
}

const SettingsMenu = () => {
  return {
    showMenu: Stream(false),
    view: ({ state, attrs: { mdl } }) => {
      let routes = mdl.Routes.filter((route) =>
        route.group.includes('authenticated')
      )
      return [
        m('.dropdown', [
          m(
            'a.btn btn-primary dropdown-toggle',
            {
              onclick: () => state.showMenu(!state.showMenu()),
              href: '#',
              tabindex: '0',
            },
            ['User Settings', m('i.icon icon-arrow-down')]
          ),
          state.showMenu() &&
            m('ul.menu', [
              m(Logout, { mdl }),
              routes.map((tab, idx) =>
                m(Tab, {
                  key: idx,
                  active: mdl.state.route.route == tab.route,
                  tab,
                  mdl,
                })
              ),
            ]),
        ]),
      ]
    },
  }
}

export default SettingsMenu
