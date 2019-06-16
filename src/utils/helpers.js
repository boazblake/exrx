import {
  compose,
  join,
  values,
  props,
  assoc,
  test,
  prop,
  filter,
  sortBy,
  toLower,
  identity,
  reverse,
  slice,
  max,
  min,
  map,
} from 'ramda'

import Task from 'data.task'

export const log = (m) => (v) => {
  console.log(m, v)
  return v
}

export const isEmpty = (data) => data.length == 0

export const infiniteScroll = (mdl) => (e) => {
  let route = mdl.state.route
  let length = mdl.data[route].data.length
  let setpoint = 10 * length * mdl.state.scrollPos
  if (e.target.scrollTop - mdl.state.scrollPos >= setpoint) {
    mdl.state.scrollPos++ + e.target.scrollTop
  }
}

export const addTerms = (item) => {
  const terms = compose(
    join(' '),
    values,
    props(['uuid', 'id', 'name'])
  )(item)

  return assoc('_terms', terms, item)
}

const byTerms = (query) =>
  compose(
    test(new RegExp(query, 'i')),
    prop('name')
  )

export const _search = (query) => compose(filter(byTerms(query)))

export const _sort = (p) =>
  sortBy(
    compose(
      toLower,
      toString,
      prop(p)
    )
  )

export const _direction = (dir) => (dir == 'asc' ? identity : reverse)

export const _paginate = (offset) => (limit) => (data) =>
  slice(
    max(0, min(offset, data.length)),
    min(offset + limit, data.length),
    data
  )

export const filterTask = (query) => (prop) => (direction) => (offset) => (
  limit
) =>
  compose(
    Task.of,
    map(_paginate(offset)(limit)),
    map(_direction(direction)),
    map(_sort(prop)),
    _search(query)
  )
