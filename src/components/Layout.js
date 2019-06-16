import m from 'mithril'
import Header from './Header.js'
import Footer from './Footer.js'
import Sidebar from './Sidebar.js'
import Modal from './Modal.js'
import Body from './Body.js'
import Navigation from './Navigation.js'
import DropDown from './DropDown.js'

const Layout = ({ attrs: { mdl } }) => {
  console.log('show settings', mdl.state.showSettings())
  return {
    view: ({ children }) =>
      m(
        'section.layout',
        {
          id: 'layout',
        },
        children
          ? [
            m(Header, { mdl }),
            mdl.state.profile == 'phone'
              ? mdl.state.showNav()
                ? m(Modal, m(Sidebar, m(Navigation, { mdl })))
                : null
              : [m(Sidebar, { classList: 'left' }, m(Navigation, { mdl }))],
            m(Body, { mdl }, [
              children,

              mdl.state.showSettings() &&
                  m(Sidebar, { classList: 'right' }, [m(DropDown, { mdl })]),
            ]),
            m(Footer, { mdl }),
          ]
          : []
      ),
  }
}

export default Layout
