import m from 'mithril'
import SocialMedia from './SocialMedia.js'

const Footer = {
  view: () =>
    m(
      'footer',
      {
        id: 'footer',
      },
      m('p.text-center', [
        `Copyright © Professional Auto Care. All rights reserved. ${new Date().getFullYear()} Privacy Policy`,
        m(SocialMedia),
      ])
    ),
}

export default Footer
