import m from 'mithril'
import ProgressBar from './ProgressBar.js'
import Hamburger from './Hamburger.js'
import Navigation from './Navigation/index.js'

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
              m(Navigation, { mdl }),
              mdl.state.profile !== 'desktop' && m(Hamburger, { mdl }),
            ],
        ]
      ),
  }
}

export default Header
