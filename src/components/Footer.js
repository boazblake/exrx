import m from 'mithril'
import { animate, animateChildrenLimitsEntrance } from '../utils/index.js'
const Footer = {
  oncreate: animate('slideUp'),
  view: () =>
    m(
      'footer',
      {
        oncreate: animateChildrenLimitsEntrance,
        id: 'footer',
      },
      'content served from NCI Clinical Trials Search API'
    ),
}

export default Footer
