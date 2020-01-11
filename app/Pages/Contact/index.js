import m from 'mithril'

const Contact = ({ attrs: { mdl } }) => {
  return { view: () => m('.contact', mdl.state.route.title) }
}

export default Contact
