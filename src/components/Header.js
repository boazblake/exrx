import m from 'mithril'
import ProgressBar from './ProgressBar.js'

const Header = {
  view: ({ attrs: { mdl } }) =>
    m(
      'header.header',
      {
        id: 'header',
      },
      [mdl.state.isLoading() ? m(ProgressBar, { mdl }) : []]
    ),
}

export default Header
