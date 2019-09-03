import m from 'mithril'

const Footer = {
  view: () =>
    m(
      'footer',
      {
        id: 'footer',
      },
      m(
        'p.p text-center',
        `Copyright © Professional Auto Care. All rights reserved. ${new Date().getFullYear()} Privacy Policy`
      )
    ),
}

export default Footer
