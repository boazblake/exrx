import m from 'mithril'

const SearchBar = ({ attrs: { mdl } }) => {
  const filterData = mdl.filterData(mdl)

  return {
    view: () => {
      return [
        m('.searchBar', {}, [
          'SEARCHBAR',

          m('input.input', { onkeyup: (e) => filterData(e.target.value) }, []),
        ]),
      ]
    },
  }
}

export default SearchBar
