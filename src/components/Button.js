import m from 'mithril'

const Button = () => {
  return {
    view: ({ attrs: { action, label } }) =>
      m('button.btn', { onclick: (e) => action(e) }, label),
  }
}

export default Button
