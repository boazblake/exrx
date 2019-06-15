import m from 'mithril'
import { IsLoading, animateComponentEntrance } from '../utils'
import { map, prop, pickAll } from 'ramda'

const Trial = () => {
  let showDescription = false
  return {
    view: ({
      attrs: {
        trial: { official_title, start_date, detail_description },
      },
    }) =>
      m(
        '.grid-item.row',
        { onclick: () => (showDescription = !showDescription) },
        [
          m('h1.left', official_title),
          m('p.right', 'Start Date', start_date),
          showDescription && m('.row', m('pre.pre', detail_description)),
        ]
      ),
  }
}

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
      m('section.component.clinical-trials', [
        state.data &&
          m(
            '.trials',
            state.data.map((trial, key) =>
              m(Trial, {
                oncreate: animateComponentEntrance(key),
                key,
                trial,
              })
            )
          ),
        isLoading() && IsLoading,
      ]),
  }
}

export default ClinicalTrials
