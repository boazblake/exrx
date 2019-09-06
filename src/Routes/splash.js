import { Layout } from '../Layouts/index.js'
import Default from '../Pages/Default'
import { flatten } from 'ramda'
import { scrollToAnchor } from 'utils'

const SubMenu = [
  {
    id: 'home-route-1',
    title: 'home-route-1',
    icon: 'home-route-1',
    route: '/home/home-route-1',
    position: [],
    group: ['home'],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'home-route-2',
    title: 'home-route-2',
    icon: 'home-route-2',
    route: '/home/home-route-2',
    position: [],
    group: ['home'],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
]

const Splash = flatten([SubMenu])

export default Splash
