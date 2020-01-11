import SocialMedia from "./SocialMedia.js"

const GoToTop = {
  view: ({ attrs: { mdl } }) =>
    m(
      "button.btn.btn-primary",
      {
        onclick: () => {
          window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth"
          })
          mdl.toggleNav(mdl)
          m.route.set(mdl.state.route.route)
        }
      },
      "Back Up"
    )
}

const Footer = {
  view: ({ attrs: { mdl } }) =>
    m(
      "footer",
      {
        id: "footer"
      },
      m("p.text-center", [
        `Copyright © Boaz Blake. All rights reserved. ${new Date().getFullYear()} Privacy Policy`,
        m(SocialMedia),
        m(GoToTop, { mdl })
      ])
    )
}

export default Footer
