import SplashHeader from "Components/Headers"
import Footer from "Components/Footer"
import Body from "Components/Body"
import ProgressBar from "Components/ProgressBar"

const SplashLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        ".splashlayout",
        {
          id: "splashlayout"
        },
        [
          mdl.state.isLoading() && m(ProgressBar, { mdl }),
          m(SplashHeader, { mdl }),
          m(Body, { mdl }, [children]),
          m(SplashHeader, { mdl }),
          m(Footer, { mdl })
        ]
      )
  }
}

export default SplashLayout
