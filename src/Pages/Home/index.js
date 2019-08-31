import m from 'mithril'

const Home = ({ attrs: { mdl } }) => {
  console.log('mdl', mdl)

  return { view: () => m('.home', mdl.state.route.title) }
}

export default Home
