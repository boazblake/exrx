import m from 'mithril'

const About = ({ attrs: { mdl, state } }) => {
  console.log('mdl', mdl)

  return { view: () => m('.about', state.title) }
}

export default About
