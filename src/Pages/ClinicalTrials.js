import m from 'mithril'
import { IsLoading, animateComponentEntrance, log } from '../utils'
import {
  map,
  pickAll,
  lensProp,
  over,
  compose,
  test,
  prop,
  filter,
} from 'ramda'
import Paginate from '../components/Paginate.js'

const trialLens = lensProp('trials')

const byTerms = (query) =>
  compose(
    test(new RegExp(query, 'i')),
    prop('official_title')
  )

const searchData = (query) => (xs) =>
  compose(
    filter(byTerms(query)),
    log('wtf')
  )(xs)

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
  const state = { error: {}, data: undefined, from: 11960, size: 10, total: 0 }
  const onError = (error) => (state.error = error)
  const onSuccess = ({ trials, total }) => {
    state.originalData = trials
    state.data = trials
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
      .fork(onError, onSuccess)

  return {
    oninit: ({
      attrs: {
        mdl: { http },
      },
    }) => fetchData(http),

    onupdate: ({
      attrs: {
        mdl: {
          state: { query },
        },
      },
    }) => {
      if (!state.data) return false
      else {
        state.data = searchData(query())(state.originalData)
      }
    },

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
          !isLoading() &&
          m('.trials', [
            state.data.map((trial, key) =>
              m(Trial, {
                oncreate: animateComponentEntrance(key),
                key,
                trial,
              })
            ),
            m(Paginate, {
              state,
              http,
              paginateFn: fetchData,
              limit,
              mdl,
            }),
          ]),
        isLoading() && IsLoading,
      ]),
  }
}

export default ClinicalTrials
