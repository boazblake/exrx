import m from 'mithril'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'
import Body from '../Components/Body.js'
import LeftAside from '../Components/LeftAside.js'
import RightAside from '../Components/RightAside.js'

const Layout = ({ attrs: { mdl } }) => {
  const showMenu = () => mdl.state.showNav() || mdl.state.profile == 'desktop'

  return {
    view: ({ children }) =>
      m(
        '.layout',
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
