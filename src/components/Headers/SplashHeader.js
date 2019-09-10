import m from 'mithril'
import Hamburger from '../Hamburger.js'
import NavTabs from '../Navigation/NavTabs.js'

const Header = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        'header.header',
        {
          id: 'header',
        },
        [
          mdl.state.profile !== 'desktop' &&
            m('.mobileNav', m(Hamburger, { mdl })),
          m(NavTabs, { mdl, tabSelected: () => {} }),
        ]
      ),
  }
}

export default Header
