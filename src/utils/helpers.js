export const isEmpty = (data) => data.length == 0

export const infiniteScroll = (mdl) => (e) => {
  let route = mdl.state.route
  let length = mdl.data[route].data.length
  let setpoint = 10 * length * mdl.state.scrollPos
  if (e.target.scrollTop - mdl.state.scrollPos >= setpoint) {
    mdl.state.scrollPos++ + e.target.scrollTop
    if (length < mdl.data[route].limit) {
      // getData(mdl)(route)
    }
  }
}
