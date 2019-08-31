import m from 'mithril'

const Footer = {
  view: () =>
    m(
      'footer',
      {
        id: 'footer',
      },
      m('p.p', 'content served from NCI Clinical Trials Search API')
    ),
}

export default Footer
