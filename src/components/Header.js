import m from 'mithril'
import Hamburger from './Hamburger.js'
import { animate } from '../utils/index.js'

const ProgressBar = () => {
  return {
    view: ({
      attrs: {
        mdl: {
          state: {
            // isLoading,
            loadingProgress: { value, max },
          },
        },
      },
    }) => m('.progressbar', m('progress', { max, value })),
  }
}

const Header = {
  oncreate: animate('slideDown'),
  view: ({ attrs: { mdl } }) =>
    m(
      'header.header',
      {
        id: 'header',
      },
      [m(Hamburger, { mdl }), m(ProgressBar, { mdl })]
    ),
}

export default Header
