import m from 'mithril'

const Button = () => {
  return {
    view: ({ attrs: { action, label, classList = '', isDisabled } }) =>
      m(
        `button.btn.${classList}`,
        { onclick: (e) => action(e), disabled: isDisabled },
        label
      ),
  }
}

export default Button
