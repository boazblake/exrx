import m from 'mithril'
import Header from './Header.js'
import Footer from './Footer.js'
import Sidebar from './Sidebar.js'
import Modal from './Modal.js'
import Body from './Body.js'

const Layout = ({ attrs: { mdl } }) => {
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
                ? m(Modal, m(Sidebar, { mdl }))
                : null
              : m(Sidebar, { mdl }),
            m(Body, { mdl, children }),
            m(Footer, { mdl }),
          ]
          : []
      ),
  }
}

export default Layout
