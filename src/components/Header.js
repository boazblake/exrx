import m from 'mithril'
import ProgressBar from './ProgressBar.js'
import Hamburger from './Hamburger.js'
import Navigation from './Navigation.js'

const Header = ({ attrs: { mdl } }) => {
  let routes = mdl.Routes.filter((r) => r.group.includes('nav'))
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        'header.header',
        {
          id: 'header',
        },
        [
          mdl.state.isLoading()
            ? m(ProgressBar, { mdl })
            : [m(Hamburger, { mdl }), m(Navigation, { routes, mdl })],
        ]
      ),
  }
}

export default Header
