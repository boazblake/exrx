import m from 'mithril'
import { Header, FooterHeader } from '../Components/Headers/index.js'
import Footer from '../Components/Footer.js'
import Body from '../Components/Body.js'

const HomeLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        '.homelayout',
        {
          id: 'homelayout',
        },
        [
          m(Body, { mdl }, m(Header, { mdl }), [children]),
          m(FooterHeader, { mdl }),
          m(Footer, { mdl }),
        ]
      ),
  }
}

export default HomeLayout
