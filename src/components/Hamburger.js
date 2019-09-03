import m from 'mithril'

const Hamburger = ({ attrs: { mdl } }) => {
  const state = {
    close:
      'M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z',
    open:
      'M10.707 7.05L10 6.343 4.343 12l1.414 1.414L10 9.172l4.243 4.242L15.657 12z',
  }

  const render = (dom) => {
    return m.render(
      dom,
      m('path', {
        xmlns: 'http://www.w3.org/2000/svg',
        d: mdl.state.showNav() ? state.close : state.open,
      })
    )
  }

  const updateDom = ({ dom }) => {
    let _dom = dom
    return render(_dom)
  }

  return {
    oncreate: updateDom,
    onupdate: updateDom,
    view: ({ attrs: { mdl } }) =>
      m('svg.btn', {
        id: 'hamburger',
        onclick: () => mdl.toggleNav(mdl),
      }),
  }
}

export default Hamburger
