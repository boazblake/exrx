import {
  compose,
  curry,
  last,
  join,
  values,
  props,
  assoc,
  test,
  prop,
  filter,
  sort,
  sortBy,
  toLower,
  toString,
  identity,
  reverse,
  slice,
  split,
  trim,
  max,
  min,
  map
} from "ramda"

import Task from "data.task"

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
})

const sortByCollator = (attr) => (xs) => {
  let listCopy = JSON.parse(JSON.stringify(xs))
  listCopy.sort((a, b) => {
    // console.log(
    //   "as and bs",
    //   attr,
    //   a[attr],
    //   b[attr],
    //   collator.compare(a[attr], b[attr])
    // )
    return collator.compare(a[attr], b[attr])
  })
  return listCopy
}

export const makeRoute = compose(join("-"), split(" "), trim(), toLower())
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

export const addTerms = (ps) => (item) => {
  const terms = compose(join(" "), values, props(ps))(item)
  return assoc("_terms", terms, item)
}

export const removeHyphens = (str) => str.replace(/-/gi, "")

const byTerms = (term) => compose(test(new RegExp(term(), "i")), prop("_terms"))

export const _search = (term) => compose(filter(byTerms(term)))

export const _sort = (attr) => (xs) => sortByCollator(attr)(xs)

export const _direction = (dir) => (dir() ? identity : reverse)

export const _paginate = (offset) => (limit) => (data) =>
  slice(
    max(0, min(offset, data.length)),
    min(offset + limit, data.length),
    data
  )

export const filterListBy = (query) => (prop) => (direction) => (xs) => {
  // console.log("filterListBy", query, prop, direction, xs)
  // (offset) => (
  //   limit
  // ) =>
  return compose(
    // log("after dir"),
    // map(_paginate(offset)(limit)),
    _direction(direction),
    // log("after sort"),
    _sort(prop),
    // log("before sort")
    _search(query)
  )(xs)
}

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

export const getRoute = () => last(m.route.get().split("/"))

export const scrollToAnchor = (anchor) => {
  let is = (el) => el !== undefined && el !== null

  //if you pass an undefined anchor it will scroll to the top of the body
  let targetEl = is(anchor) ? document.getElementById(anchor) : document.body
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop
  let target = is(targetEl) ? targetEl.getBoundingClientRect().top : 0
  window.scroll({
    top: target + scrollTop - 10,
    left: 0,
    behavior: "smooth"
  })
}

export const jsonCopy = (src) => JSON.parse(JSON.stringify(src))
