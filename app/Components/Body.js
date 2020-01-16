import Toaster from "./Toaster.js"

const Body = {
  view: ({ children, attrs: { mdl } }) =>
    m(
      ".main",
      {
        id: "main"
      },
      [children, mdl.state.toast.show() && m(Toaster, { mdl })]
    )
}

export default Body
