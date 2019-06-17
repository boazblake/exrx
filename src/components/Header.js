import m from 'mithril'
import Hamburger from './Hamburger.js'
import Button from './Button.js'
import ProgressBar from './ProgressBar.js'
import { animate } from '../utils'

const Header = {
  oncreate: animate('slideDown'),
  view: ({ attrs: { mdl } }) =>
    m(
      'header.header',
      {
        id: 'header',
      },
      [
        m(Hamburger, { mdl }),
        m(ProgressBar, { mdl }),
        m(Button, {
          classList: 'right',
          label: m.trust('&#9881;'),
          action: () => mdl.toggleSettings(mdl),
        }),
      ]
    ),
}

export default Header
