import m from 'mithril'

const Discounts = ({ attrs: { mdl } }) => {
  return { view: () => m('.discounts', mdl.state.route.title) }
}

export default Discounts
