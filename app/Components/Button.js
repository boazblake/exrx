import m from "mithril"

const Button = () => {
  return {
    view: ({ attrs: { mdl, action, label, classList = "", isDisabled } }) =>
      m(
        `button.btn.${classList} ${mdl.state.isLoading() ? "loading" : ""}`,
        { onclick: (e) => action(e), disabled: isDisabled },
        label
      )
  }
}

export default Button
