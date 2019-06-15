import m from 'mithril'
import { IsLoading } from '../utils'
import { map, prop, pickAll } from 'ramda'

const ClinicalTrials = () => {
  const state = { error: {}, data: undefined }
  const onError = (error) => (state.error = error)
  const onSuccess = (data) => (state.data = data)

  const onLoad = (http) => {
    http
      .getTask('https://clinicaltrialsapi.cancer.gov/v1/clinical-trials')({
        from: 1,
        size: 10,
      })
      .map(prop('trials'))
      .map(map(pickAll(['official_title', 'detail_description', 'start_date'])))
      .fork(onError, onSuccess)
  }

  return {
    oninit: ({
      attrs: {
        mdl: { http },
      },
    }) => onLoad(http),
    view: ({
      attrs: {
        mdl: {
          state: { isLoading },
        },
      },
    }) =>
      m('.clinical-trials', 'CLINICAL TRIALS', [
        state.data && m('code', JSON.stringify(state, null, 2)),
        isLoading() && IsLoading,
      ]),
  }
}

export default ClinicalTrials
