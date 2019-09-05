import m from 'mithril'

const Toaster = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m('.toast', { class: `toast-${mdl.state.toast.class()}` }, [
        m('button.btn btn-clear', { id: 'btn-toast' }),
        mdl.state.toast.contents(),
      ]),
  }
}

export default Toaster
