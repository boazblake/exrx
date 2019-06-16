import m from 'mithril'

const Button = () => {
  return {
    view: ({ attrs: { action, label, classList } }) =>
      m(`button.btn.${classList}`, { onclick: (e) => action(e) }, label),
  }
}

export default Button
