import Layout from '../Layout.js'
import Default from '../Pages/Default'
import { scrollToAnchor } from 'utils'
import Icons from 'icons'

const Main = [
  {
    id: 'home',
    title: 'Home',
    icon: Icons.home,
    route: '/home',
    position: ['nav'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },

  {
    id: 'services',
    title: 'Services',
    icon: Icons.services,
    route: '/services',
    position: ['nav', 'sidebar'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'discounts',
    title: 'Discounts',
    icon: 'discounts',
    route: '/discounts',
    position: ['nav', 'footer'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
      if (!mdl.state.isAuth()) return m.route.SKIP
      console.log('WTF IS GOING ON', mdl.Routes, mdl.state.isAuth())
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'vendors',
    title: 'Vendors',
    icon: 'vendors',
    route: '/vendors',
    position: ['nav', 'footer'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'about',
    title: 'About',
    icon: 'about',
    route: '/about',
    position: ['nav'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: Icons.contact,
    route: '/contact',
    position: ['nav', 'footer'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'blog',
    title: 'Blog',
    icon: 'blog',
    route: '/blog',
    position: ['nav', 'footer'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
]

export default Main
