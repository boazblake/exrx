import m from 'mithril'
import Button from '../components/Button.js'

const Paginate = {
  view: ({ attrs: { state, http, paginateFn, limit, mdl } }) =>
    m('.pagination.row', [
      m(Button, {
        action: () => {
          state.from = state.from - mdl.state.limit
          state.size = mdl.state.limit
          paginateFn(http)
        },
        isDisabled: state.from - mdl.state.limit <= 0,
        label: `Load Prev ${limit}`,
      }),
      m('code.code', `${state.from} / ${state.from + state.size} `),
      m(Button, {
        action: () => {
          state.from = state.from + state.data.length++
          state.size = mdl.state.limit
          paginateFn(http)
        },
        label: `Load Next ${limit} of ${state.total}`,
        isDisabled: state.from + mdl.state.limit > state.total,
      }),
    ]),
}

export default Paginate
