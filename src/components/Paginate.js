import m from 'mithril'
import Button from '../components/Button.js'

const Paginate = {
  view: ({ attrs: { state, http, paginateFn, limit, mdl } }) =>
    m('.pagination', [
      `Showing ${state.from} to ${state.from + state.size} `,
      m(Button, {
        action: () => {
          state.from = state.from + state.data.length++
          state.size = mdl.state.limit
          paginateFn(http)
        },
        label: `Load Next ${limit} of ${state.total}`,
      }),
    ]),
}

export default Paginate
