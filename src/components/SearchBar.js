import m from 'mithril'

const SearchBar = ({ attrs: { mdl } }) => {
  const filterData = mdl.filterData(mdl)

  return {
    view: () =>
      m('.searchBar', [
        m('input.input', {
          placeholder: 'search query',
          oninput: (e) => filterData(e.target.value),
        }),
      ]),
  }
}

export default SearchBar
