import m from 'mithril'

const Footer = {
  view: () =>
    m(
      'footer',
      {
        id: 'footer',
      },
      m('p.p', 'PAC')
    ),
}

export default Footer
