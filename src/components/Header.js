import m from 'mithril'
import Hamburger from './Hamburger.js'
import ProgressBar from './ProgressBar.js'
import DropDown from './DropDown.js'
import SearchBar from './SearchBar.js'
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
        mdl.state.isLoading()
          ? m(ProgressBar, { mdl })
          : [
            m(Hamburger, { mdl }),
            m(SearchBar, { mdl }),
            m(DropDown, { mdl }),
          ],
      ]
    ),
}

export default Header
