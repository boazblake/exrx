import m from 'mithril'

const ProgressBar = () => {
  return {
    view: ({
      attrs: {
        mdl: {
          state: {
            isLoading,
            loadingProgress: { value, max },
          },
        },
      },
    }) =>
      isLoading() && m('.progressBar', m('progress.progress', { max, value })),
  }
}

export default ProgressBar
