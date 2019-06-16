import m from 'mithril'
import { IsLoading, animateComponentEntrance } from '../utils'
import {
  replace,
  map,
  pickAll,
  lensProp,
  over,
  compose,
  test,
  props,
  filter,
} from 'ramda'
import Paginate from '../components/Paginate.js'

const trialLens = lensProp('trials')

const byTerms = (query) =>
  compose(
    test(new RegExp(query, 'i')),
    props(['official_title', 'detail_description'])
  )

const markBy = (q) => (str) =>
  replace(new RegExp(q, 'gi'), `<mark>${q}</mark>`, str)

const searchData = (query) =>
  compose(
    map(map(markBy(query))),
    filter(byTerms(query))
  )

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
          m('h1.left', m.trust(official_title)),
          m('p.right', 'Start Date: ', m('pre', start_date)),
          showDescription &&
            m('.row', m('pre.pre', m.trust(detail_description))),
        ]
      ),
  }
}

const ClinicalTrials = ({ attrs: { mdl } }) => {
  const state = { error: {}, data: undefined, ...mdl.state.paginate }
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

    onbeforeupdate: ({
      attrs: {
        mdl: {
          state: { query },
        },
      },
    }) =>
      state.data && query().length > 1
        ? (state.data = searchData(query())(state.originalData))
        : true,
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
