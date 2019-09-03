import m from 'mithril'
import ProgressBar from './ProgressBar.js'
import Hamburger from './Hamburger.js'
import Navigation from './Navigation/index.js'

const goToTop =
  'M10.707 7.05L10 6.343 4.343 12l1.414 1.414L10 9.172l4.243 4.242L15.657 12z'

const Header = () => {
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
            : [
              mdl.state.profile !== 'desktop' &&
                  m('.mobileNav', [
                    mdl.state.showNav() &&
                      m(
                        'svg.btn.hamburger',
                        {
                          onclick: () => window.scrollTo(0, 0),
                        },
                        m('path', {
                          id: 'goToTop',
                          xmlns: 'http://www.w3.org/2000/svg',
                          d: goToTop,
                        })
                      ),
                    m(Hamburger, { mdl }),
                  ]),
              m(Navigation, { mdl }),
            ],
        ]
      ),
  }
}

export default Header
