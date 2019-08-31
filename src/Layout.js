import m from 'mithril'
import Header from './components/Header.js'
import Footer from './components/Footer.js'
import Body from './components/Body.js'
import LeftAside from './components/LeftAside.js'
import RightAside from './components/RightAside.js'

const Layout = ({ attrs: { mdl } }) => {
  const showMenu = () => mdl.state.showNav() || mdl.state.profile == 'desktop'

  return {
    view: ({ children }) =>
      m(
        'section.layout',
        {
          id: 'layout',
        },
        [
          m(Header, { mdl }),
          showMenu() && m(LeftAside, { mdl }),
          m(Body, { mdl }, [children]),
          m(RightAside, { mdl }),
          m(Footer, { mdl }),
        ]
      ),
  }
}

export default Layout
