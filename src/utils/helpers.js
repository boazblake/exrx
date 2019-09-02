import m from 'mithril'

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

// const smoothScrolling = () => {
//   $(function () {
//     $('a[href*="#"]:not([href="#"])').click(function () {
//       if (
//         location.pathname.replace(/^\//, '') ==
//         this.pathname.replace(/^\//, '') &&
//         location.hostname == this.hostname
//       ) {
//         var target = $(this.hash)
//         target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')
//         if (target.length) {
//           $('html, body').animate(
//             {
//               scrollTop: target.offset().top,
//             },
//             900,
//             'swing'
//           )
//           return false
//         }
//       }
//     })
//   })}

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

export const debounce = (wait, now) => (fn) => {
  let timeout = undefined
  return function() {
    let context = this
    let args = arguments
    let later = function() {
      timeout = undefined
      if (!now) fn.apply(context, args)
    }
    let callNow = now && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    console.log(fn)
    if (callNow) fn.apply(context, args)
  }
}

export const getRoute = (int) => m.route.get().split('/')[int]

export const scrollToAnchor = (anchor) => {
  let is = (el) => el !== undefined && el !== null

  console.log('anchor', document.getElementById(anchor), document.body)

  //if you pass an undefined anchor it will scroll to the top of the body
  let targetEl = is(anchor) ? document.getElementById(anchor) : document.body
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop
  let target = is(targetEl) ? targetEl.getBoundingClientRect().top : 0
  console.log('ANCHOR', anchor)
  console.log('targetEL', targetEl)
  console.log('scrollTop', scrollTop)
  console.log('target', target)
  window.scroll({
    top: target + scrollTop - 70,
    left: 0,
    behavior: 'smooth',
  })
}
