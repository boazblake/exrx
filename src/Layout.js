import m from 'mithril'
import Header from './components/Header.js'
import Footer from './components/Footer.js'
import Body from './components/Body.js'
import Navigation from './components/Navigation.js'

const Layout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        'section.layout',
        {
          id: 'layout',
        },
        [
          m(Header, { mdl }),
          mdl.state.showNav() && m(Navigation, { mdl }),
          m('', { id: 'leftcol' }, 'left'),
          m(Body, { mdl }, [children]),
          m('', { id: 'rightcol' }, 'right'),
          m(Footer, { mdl }),
        ]
      ),
  }
}

export default Layout
