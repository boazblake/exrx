import m from 'mithril'
import Hamburger from './Hamburger.js'
import Button from './Button.js'
import SearchBar from './SearchBar.js'
import { animate } from '../utils/index.js'

const ProgressBar = () => {
  return {
    view: ({
      attrs: {
        mdl: {
          state: {
            isLoading,
            loadingProgress: { value, max },
          },
        },
      },
    }) =>
      isLoading() && m('.progressBar', m('progress.progress', { max, value })),
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
      [
        m(Hamburger, { mdl }),
        m(ProgressBar, { mdl }),

        m(SearchBar, { mdl }),

        m(Button, {
          classList: 'right',
          label: m.trust('&#9881;'),
          action: () => {
            console.log('settigns', mdl.state.showSettings())
            mdl.toggleSettings(mdl)
          },
        }),
      ]
    ),
}

export default Header
