import m from 'mithril'
import { Header } from '../Components/Headers/index.js'
import Footer from '../Components/Footer.js'
import Body from '../Components/Body.js'
import LeftAside from '../Components/LeftAside.js'
import RightAside from '../Components/RightAside.js'

const MainLayout = ({ attrs: { mdl } }) => {
  const showMenu = () => mdl.state.showNav() || mdl.state.profile == 'desktop'

  return {
    view: ({ children }) =>
      m(
        '.mainLayout',
        {
          id: 'mainLayout',
        },
        [
          m(Header, { mdl, isNotHome: true }),
          showMenu() && m(LeftAside, { mdl }),
          m(Body, { mdl }, [children]),
          m(RightAside, { mdl }),
          m(Footer, { mdl }),
        ]
      ),
  }
}

export default MainLayout
