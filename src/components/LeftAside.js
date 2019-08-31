import m from 'mithril'
import Navigation from './Navigation'

const LeftAside = ({ attrs: { mdl } }) => {
  let routes = mdl.Routes.filter((r) => r.group.includes('sidebar'))
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        '.container',
        { id: 'aside' },
        m(
          '.columns col-gapless',
          m(Navigation, { classList: 'column col-3', routes, mdl })
        )
      ),
  }
}
export default LeftAside
