import m from 'mithril'
import NavTabs from '../Navigation/NavTabs.js'

const FooterHeader = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        'header.footerheader',
        {
          id: 'footerheader',
        },
        m(NavTabs, { mdl, tabSelected: () => 'home' })
      ),
  }
}

export default FooterHeader
