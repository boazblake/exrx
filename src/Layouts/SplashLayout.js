import m from 'mithril'
import { Header, FooterHeader } from '../Components/Headers/index.js'
import Footer from '../Components/Footer.js'
import Body from '../Components/Body.js'

const SplashLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        '.splashlayout',
        {
          id: 'splashlayout',
        },
        [
          m(Header, { mdl }),
          m(Body, { mdl }, [children]),
          m(FooterHeader, { mdl }),
          m(Footer, { mdl }),
        ]
      ),
  }
}

export default SplashLayout
