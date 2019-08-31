import m from 'mithril'

const AirConditioning = ({ attrs: { mdl, state } }) => {
  console.log('mdl', mdl)

  return { view: () => m('.air-conditioning', state.title) }
}

export default AirConditioning
