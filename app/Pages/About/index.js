import m from 'mithril'

const About = ({ attrs: { mdl } }) => {
  // console.log('mdl', mdl)

  return { view: () => m('.about', mdl.state.route.title) }
}

export default About
