import m from 'mithril'
import ProgressBar from './ProgressBar.js'
import Hamburger from './Hamburger.js'
import Navigation from './Navigation.js'

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
              mdl.state.profile !== 'desktop' && m(Hamburger, { mdl }),
              m(Navigation, { mdl }),
            ],
        ]
      ),
  }
}

export default Header
