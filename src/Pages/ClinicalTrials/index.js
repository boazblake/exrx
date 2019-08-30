import m from 'mithril'
import { IsLoading, animateComponentEntrance } from '../../utils'
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
import Paginate from '../../components/Paginate.js'

const trialLens = lensProp('trials')

const byTerms = (ps) => (query) =>
  compose(
    test(new RegExp(query, 'i')),
    props(ps)
  )

const markBy = (q) => (str) =>
  q
    ? replace(new RegExp(q, 'gi'), `<span class="marked">${q}</span>`, str)
    : str

const searchData = (ps) => (query) =>
  compose(
    map(map(markBy(query))),
    filter(byTerms(ps)(query))
  )

const Trial = () => {
  let showDescription = false
  return {
    view: ({
      attrs: {
        trial: { official_title, start_date, detail_description },
      },
    }) =>
      m('.', { onclick: () => (showDescription = !showDescription) }, [
        m('h1', m.trust(official_title)),
        m('p', 'Start Date: ', m('pre', start_date)),
        showDescription && m('.', m('pre', m.trust(detail_description))),
      ]),
  }
}

const ClinicalTrials = ({ attrs: { mdl } }) => {
  const state = {
    error: {},
    data: undefined,
    ...mdl.state.paginate,
    props: ['official_title', 'detail_description'],
  }
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
    'nci_id',
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
      state.data
        ? (state.data = searchData(state.props)(query())(state.originalData))
        : true,
    view: ({
      attrs: {
        mdl: {
          http,
          state: { isLoading, limit },
        },
      },
    }) =>
      m('section.clinical-trials', [
        m(Paginate, {
          state,
          http,
          paginateFn: fetchData,
          limit,
          mdl,
        }),
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
          ]),
        isLoading() && IsLoading,
      ]),
  }
}

export default ClinicalTrials
