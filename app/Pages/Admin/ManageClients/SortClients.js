const SortClients = () => {
  return {
    view: ({ attrs: { list, props, state, sort } }) =>
      m(".sort", [
        m(
          "select",
          {
            onchange: (e) => {
              state.sortProp = e.target.value
              sort(state)(list)
            }
          },
          props.map(({ key, value }) => m("option", { key, value }, key))
        )
      ])
  }
}

export default SortClients
