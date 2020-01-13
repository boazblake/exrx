import ProfileHeader from "Components/Headers/ProfileHeader"
import Footer from "Components/Footer"
import LeftAside from "Components/LeftAside"
import Body from "Components/Body"

const ProfileLayout = ({ attrs: { mdl } }) => {
  const showMenu = () => mdl.state.showNav() || mdl.state.profile == "desktop"

  return {
    view: ({ children }) =>
      m(
        ".profileLayout",
        {
          id: "profileLayout"
        },
        [
          m(ProfileHeader, { mdl }),
          showMenu() && m(LeftAside, { mdl }),
          m(Body, { mdl }, [children]),
          m(Footer, { mdl })
        ]
      )
  }
}

export default ProfileLayout
