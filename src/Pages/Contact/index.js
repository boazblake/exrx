import m from 'mithril'

const Contact = ({ attrs: { mdl, state } }) => {
  console.log('mdl', mdl)

  return { view: () => m('.contact', state.title) }
}

export default Contact
