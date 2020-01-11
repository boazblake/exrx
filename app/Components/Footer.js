import SocialMedia from "./SocialMedia.js"

const Footer = {
  view: () =>
    m(
      "footer",
      {
        id: "footer"
      },
      m("p.text-center", [
        `Copyright © Boaz Blake. All rights reserved. ${new Date().getFullYear()} Privacy Policy`,
        m(SocialMedia)
      ])
    )
}

export default Footer
