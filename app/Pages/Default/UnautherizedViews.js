import Icons from "Components/Icons"
import AuthComponent from "Components/Auth"

const UnautherizedView = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(".empty", [
        m("svg.unauth-lock", Icons.lock),
        m("p.empty-title.h5", "Registered Users Only"),
        m("p.empty-subtitle", [
          m(
            "button.btn",
            {
              onclick: () => mdl.toggleAuthModal(mdl)
            },
            "Register or Log in to view this content"
          ),
          m(AuthComponent, { mdl })
        ])
      ])
  }
}

export default UnautherizedView
