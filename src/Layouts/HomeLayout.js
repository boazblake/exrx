import m from 'mithril'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'
import Body from '../Components/Body.js'

const Layout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        '.layout',
        {
          id: 'layout',
        },
        [m(Header, { mdl }), m(Body, { mdl }, [children]), m(Footer, { mdl })]
      ),
  }
}

export default Layout
