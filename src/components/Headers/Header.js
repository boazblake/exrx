import m from 'mithril'
import ProgressBar from '../ProgressBar.js'
import Hamburger from '../Hamburger.js'
import Navigation from '../Navigation/index.js'

const Header = ({ attrs: { isNotHome } }) => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        'header.header',
        {
          id: 'header',
        },
        [
          mdl.state.isLoading() && m(ProgressBar, { mdl }),

          mdl.state.profile !== 'desktop' &&
            m('.mobileNav', m(Hamburger, { mdl })),
          m(Navigation, { mdl, isNotHome }),
        ]
      ),
  }
}

export default Header
