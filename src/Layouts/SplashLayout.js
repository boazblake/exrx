import m from 'mithril'
import { SplashHeader } from '../Components/Headers/index.js'
import Footer from '../Components/Footer.js'
import Body from '../Components/Body.js'
import ProgressBar from '../Components/ProgressBar.js'

const SplashLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        '.splashlayout',
        {
          id: 'splashlayout',
        },
        [
          mdl.state.isLoading() && m(ProgressBar, { mdl }),
          m(SplashHeader, { mdl }),
          m(Body, { mdl }, [children]),
          m(SplashHeader, { mdl }),
          m(Footer, { mdl }),
        ]
      ),
  }
}

export default SplashLayout
