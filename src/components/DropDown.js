import {
  animateChildrenLimitsEntrance,
  animateChildrenLimitsExit,
} from '../utils/animations.js'

const Selector = {
  onbeforeremove: animateChildrenLimitsExit,
  view: ({ attrs: { mdl } }) =>
    m(
      '.limits',
      mdl.limits.map((limit, idx) =>
        m(
          'button.btn.limit',
          {
            oncreate: animateChildrenLimitsEntrance(idx),
            onclick: () => {
              mdl.state.limit = limit
              mdl.state.showLimits(false)
            },
            key: idx,
          },
          limit
        )
      )
    ),
}

const DropDown = {
  view: ({ attrs: { mdl } }) =>
    m('.changeLimits', [
      m(
        'button.changeLimitBtn',
        {
          onclick: () => mdl.toggleLimits(mdl),
        },
        'Change Limit'
      ),
      mdl.state.showLimits() && m(Selector, { mdl }),
    ]),
}

export default DropDown
