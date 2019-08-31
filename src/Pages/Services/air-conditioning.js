import m from 'mithril'

const AirConditioning = ({ attrs: { mdl } }) => {
  console.log('mdl', mdl)

  return { view: () => m('.air-conditioning', mdl.state.route.title) }
}

export default AirConditioning
