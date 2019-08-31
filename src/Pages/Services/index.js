import m from 'mithril'

const Home = ({ attrs: { mdl, state } }) => {
  console.log('mdl', mdl)

  return { view: () => m('.home', state.title) }
}

export default Home
