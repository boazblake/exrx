import m from 'mithril'
import Icons from 'icons'

const UnautherizedView = () => {
  return {
    view: () =>
      m('.empty', [
        m('svg.unauth-lock', Icons.lock),
        m('p.empty-title.h5', 'Registered Users Only'),
        m(
          'p.empty-subtitle',
          m('button.btn', 'Register or Log in to view this content')
        ),
      ]),
  }
}

export default UnautherizedView
