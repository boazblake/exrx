import m from 'mithril'
import Menu from './Menu'

const LeftAside = ({ attrs: { mdl } }) => {
  let routes = mdl.Routes.filter((r) => r.position.includes('sidebar'))
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        '.left-aside menu',
        { id: 'left-aside' },
        m('ul.columns', m(Menu, { classList: 'column', routes, mdl }))
      ),
  }
}
export default LeftAside
