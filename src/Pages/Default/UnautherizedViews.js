import m from 'mithril'
import lock from 'icons/lock.js'

const UnautherizedView = () => {
  return {
    view: () =>
      m('.empty', [
        m('svg.unauth-lock', lock),
        m('p.empty-title.h5', 'Registered Users Only'),
        m(
          'p.empty-subtitle',
          m('button.btn', 'Register or Log in to continue seeing this content')
        ),
      ]),
  }
}

export default UnautherizedView
