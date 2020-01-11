import ProgressBar from "Components/ProgressBar"
import Hamburger from "Components/Hamburger"
import Navigation from "Components/Navigation"

console.log(ProgressBar)

const Header = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        "header.header",
        {
          id: "header"
        },
        [
          mdl.state.isLoading() && m(ProgressBar, { mdl }),

          mdl.state.profile !== "desktop" &&
            m(".mobileNav", m(Hamburger, { mdl })),
          m(Navigation, { mdl })
        ]
      )
  }
}

export default Header
