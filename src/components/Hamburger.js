import m from 'mithril'

const Hamburger = ({ attrs: { mdl } }) => {
  const state = {
    close:
      'M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z',
    open:
      'M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
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
      m('svg.btn.hamburger', {
        id: 'hamburger',
        onclick: () => mdl.toggleNav(mdl),
      }),
  }
}

export default Hamburger
