import m from 'mithril'

const UnautherizedView = () => {
  return {
    view: ({ attrs: { mdl } }) => {
      console.log('mdl', mdl)
      return m('div.empty', [
        m('div.empty-icon', m('i.icon.icon-3x.icon-people')),
        m('p.empty-title.h5', 'It appears you are not autherized'),
        m(
          'p.empty-subtitle',
          m('button.btn', 'Register or Log in to see this content')
        ),
      ])
    },
  }
}

export default UnautherizedView
