import m from 'mithril'

const ProgressBar = () => {
  return {
    view: ({
      attrs: {
        mdl: {
          state: {
            loadingProgress: { value, max },
          },
        },
      },
    }) => m('.progressBar', m('progress.progress', { max, value })),
  }
}

export default ProgressBar
