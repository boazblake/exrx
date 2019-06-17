import m from 'mithril'
import { debounce } from '../utils/helpers'

let debounce300 = debounce(300)

const SearchBar = ({ attrs: { mdl } }) => {
  const filterData = mdl.filterData(mdl)

  return {
    view: () =>
      m('.searchBar', [
        m('input.input', {
          placeholder: 'search query',
          oninput: (e) => debounce300(filterData(e.target.value)),
        }),
      ]),
  }
}

export default SearchBar
