import m from 'mithril'
import lock from 'icons/lock.js'

console.log(lock)

const UnautherizedView = () => {
  return {
    view: () =>
      m('.empty', [
        m('svg.unauth-lock', lock),
        m('.empty-icon', m('i.icon.icon-3x.icon-lock')),
        m('p.empty-title.h5', 'It appears you are not autherized'),
        m(
          'p.empty-subtitle',
          m('button.btn', 'Register or Log in to see this content')
        ),
      ]),
  }
}

export default UnautherizedView
