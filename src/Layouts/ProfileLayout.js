import m from 'mithril'
import { Header } from '../Components/Headers/index.js'
import Footer from '../Components/Footer.js'
import Body from '../Components/Body.js'

const ProfileLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        '.profilelayout',
        {
          id: 'profilelayout',
        },
        [m(Body, { mdl }, m(Header, { mdl }), [children]), m(Footer, { mdl })]
      ),
  }
}

export default ProfileLayout
