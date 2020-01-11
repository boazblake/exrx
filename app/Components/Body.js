import Toaster from "./Toaster.js"

const Body = {
  view: ({ children, attrs: { mdl } }) =>
    m(
      ".content",
      {
        id: "content"
      },
      [children, mdl.state.toast.show() && m(Toaster, { mdl })]
    )
}

export default Body
