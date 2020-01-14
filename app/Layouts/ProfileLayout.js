import ProfileHeader from "Components/Headers/ProfileHeader"
import Footer from "Components/Footer"
import LeftAside from "Components/LeftAside"
import Body from "Components/Body"
import Modal from "Components/Modal"

const ProfileLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        ".profileLayout",
        {
          id: "profileLayout"
        },
        [
          m(ProfileHeader, { mdl }),
          mdl.state.profile !== "desktop"
            ? m(Modal, {
                isActive: mdl.state.showSidebarModal(),
                close: () => mdl.toggleSidebarModal(mdl),
                classList: "",
                mdl,
                content: m(LeftAside, { mdl })
              })
            : m(LeftAside, { mdl }),
          m(Body, { mdl }, [children]),
          m(Footer, { mdl })
        ]
      )
  }
}

export default ProfileLayout
