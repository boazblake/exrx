import m from "mithril"
import Button from "Components"

const Paginate = {
  view: ({ attrs: { state, http, paginateFn, limit, mdl } }) =>
    m(".pagination", [
      m(Button, {
        action: () => {
          state.from = state.from - mdl.state.limit
          state.size = mdl.state.limit
          paginateFn(http)
        },
        isDisabled: state.from - mdl.state.limit <= 0,
        label: [m.trust("&#8678;"), limit]
      }),
      m(Button, {
        action: () => {
          state.from = state.from + state.data.length++
          state.size = mdl.state.limit
          paginateFn(http)
        },
        label: [limit, m.trust("&#8680;")],
        isDisabled: state.from + mdl.state.limit > state.total
      }),
      m(
        ".",
        m("code.code", `${state.from} - ${state.from + state.size} `),
        m("code.code.row", ` of ${state.total} `)
      )
    ])
}

export default Paginate
