import m from 'mithril'
import Header from './components/Header.js'
import Footer from './components/Footer.js'
import Body from './components/Body.js'
import Modal from './components/Modal.js'
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
            mdl.state.showModal() &&
                m(
                  Modal,
                  { mdl },
                  m('code.about', 'Search For Clinical Trials')
                ),
            m(Body, { mdl }, [children]),
            m(Footer, { mdl }),
          ]
          : []
      ),
  }
}

export default Layout
