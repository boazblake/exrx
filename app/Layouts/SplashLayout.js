import SplashHeader from "Components/Headers/SplashHeader"
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
          m(SplashHeader, { mdl }),
          m(Body, { mdl }, [children]),
          m(Footer, { mdl })
        ]
      )
  }
}

export default SplashLayout
