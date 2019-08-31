import m from 'mithril'

const Default = ({ attrs: { mdl } }) => {
  // console.log('mdl', mdl)

  return { view: () => m('.default', mdl.state.route.title) }
}

export default Default
