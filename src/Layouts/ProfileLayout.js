import m from 'mithril'
import { Header } from '../Components/Headers/index.js'
import Footer from '../Components/Footer.js'
import LeftAside from '../Components/LeftAside.js'
import Body from '../Components/Body.js'

const ProfileLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        '.profileLayout',
        {
          id: 'profileLayout',
        },
        [
          m(Header, { mdl }),
          m(LeftAside, { mdl }),
          m(Body, { mdl }, [children]),
          m(Footer, { mdl }),
        ]
      ),
  }
}

export default ProfileLayout
