import m from 'mithril'

const Home = ({ attrs: { mdl } }) => {
  console.log('mdl', mdl)

  return { view: () => m('.home', [m('section.')]) }
}

export default Home
