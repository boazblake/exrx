import NavTabs from "../Navigation/NavTabs.js"
import ProgressBar from "Components/ProgressBar"

const SplashHeader = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        "header.header",
        {
          id: "header"
        },
        [
          mdl.state.isLoading() && m(ProgressBar, { mdl }),

          m(NavTabs, { mdl, tabSelected: () => {} })
        ]
      )
  }
}

export default SplashHeader
