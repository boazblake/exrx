import m from 'mithril'
import Section2 from './section2.js'
import Section1 from './section1.js'

const Home = ({ attrs: { mdl } }) => {
  console.log('mdl', mdl)

  return {
    view: () =>
      m('.home', [
        m(Section1, { mdl }),
        m(Section2, { mdl }),
        m(
          'section.home-section hero hero-lg bg-primary parall',
          m('.hero-body', m('h1', 'section 3'))
        ),
        m(
          'section.home-section hero hero-lg bg-secondary',
          m('.hero-body', m('h1', 'section 4'))
        ),
      ]),
  }
}

export default Home
