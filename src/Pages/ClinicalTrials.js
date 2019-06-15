import m from 'mithril'
import { IsLoading, animateComponentEntrance, log } from '../utils'
import { map, pickAll, lensProp, over } from 'ramda'
import Button from '../components/Button.js'

const trialLens = lensProp('trials')

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
          m('p.right', 'Start Date: ', m('pre', start_date)),
          showDescription && m('.row', m('pre.pre', detail_description)),
        ]
      ),
  }
}

const ClinicalTrials = ({ attrs: { mdl } }) => {
  const state = { error: {}, data: undefined, from: 1, size: 10, total: 0 }
  const onError = (error) => (state.error = error)
  const onSuccess = ({ trials, total }) => {
    state.data = trials
    state.from = state.data.length++
    state.size = mdl.state.limit
    state.total = total
  }

  const getTrialData = pickAll([
    'official_title',
    'detail_description',
    'start_date',
  ])

  const fetchData = (http) =>
    http
      .getTask('https://clinicaltrialsapi.cancer.gov/v1/clinical-trials')({
        from: state.from,
        size: state.size,
      })
      .map(over(trialLens, map(getTrialData)))
      .map(log('wtf'))

      .fork(onError, onSuccess)

  return {
    oninit: ({
      attrs: {
        mdl: { http },
      },
    }) => fetchData(http),
    view: ({
      attrs: {
        mdl: {
          http,
          state: { isLoading, limit },
        },
      },
    }) =>
      m('section.component.clinical-trials', [
        state.data &&
          m('.trials', [
            state.data.map((trial, key) =>
              m(Trial, {
                oncreate: animateComponentEntrance(key),
                key,
                trial,
              })
            ),
            m('.actions', [
              m(Button, {
                action: () => fetchData(http),
                label: `Load Next ${limit} of ${state.total}`,
              }),
            ]),
          ]),
        isLoading() && IsLoading,
      ]),
  }
}

export default ClinicalTrials
