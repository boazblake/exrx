import m from 'mithril'
import Brand from 'assets/professional-auto-care-logo-brand.png'

const Section1 = ({ attrs: { mdl } }) => {
  console.log('mdl', mdl)

  return {
    view: () =>
      m('.hero-body parallax', [
        m('.parallax-top-left'),
        m('.parallax-top-right'),
        m('.parallax-bottom-left'),
        m('.parallax-bottom-right'),
        m('.parallax-content', [
          m('h1.h1 parallax-front text-center', 'section 1'),
          m('img.img center', {
            height: '500px',
            width: '100%',
            src: Brand,
          }),
        ]),
      ]),
  }
}

export default Section1
