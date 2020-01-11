import Header from "Components/Headers/Header"
import Footer from "Components/Footer"
import LeftAside from "Components/LeftAside"
import Body from "Components/Body"

const ProfileLayout = ({ attrs: { mdl } }) => {
  return {
    view: ({ children }) =>
      m(
        ".profileLayout",
        {
          id: "profileLayout"
        },
        [
          m(Header, { mdl }),
          m(LeftAside, { mdl }),
          m(Body, { mdl }, [children]),
          m(Footer, { mdl })
        ]
      )
  }
}

export default ProfileLayout
