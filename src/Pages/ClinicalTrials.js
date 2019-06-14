import m from 'mithril'
import { IsLoading } from '../utils'

const ClinicalTrials = (v) => {
  const state = { error: {}, data: undefined }
  const onError = (error) => (state.error = error)
  const onSuccess = (data) => (state.data = data)

  const onLoad = (http) =>
    http
      .getTask('https://clinicaltrialsapi.cancer.gov/v1/clinical-trials')({
        // from: 1,
        // size: 1,
      })
      .fork(onError, onSuccess)

  return {
    oninit: ({
      attrs: {
        mdl: { http },
      },
    }) => onLoad(http),
    view: () =>
      m(
        '.clinical-trials',
        'CLINICAL TRIALS',
        state.data && state.data.trials
          ? m('code', JSON.stringify(state, null, 2))
          : IsLoading
      ),
  }
}

export default ClinicalTrials
