import Layout from '../Layout.js'
import Default from '../Pages/Default'

import home from '../assets/icons/home.js'
import contact from '../assets/icons/contact.js'
import services from '../assets/icons/services.js'

const Main = [
  {
    id: 'home',
    title: 'Home',
    icon: home,
    route: '/home',
    position: ['nav'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, anchor) => {
      console.log('path and route', fullroute, anchor)
      // return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },

  {
    id: 'services',
    title: 'Services',
    icon: services,
    route: '/services',
    position: ['nav', 'sidebar'],
    group: [],
    children: ['air-conditioning', 'check-engine-light'],
    onmatch: (mdl, args, path, fullroute, anchor) => {
      console.log('path and route', fullroute, anchor)
      // return (mdl.state.route = route)
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
    onmatch: (mdl, args, path, fullroute, anchor) => {
      console.log('path and route', fullroute, anchor)
      // return (mdl.state.route = route)
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
    onmatch: (mdl, args, path, fullroute, anchor) => {
      console.log('path and route', fullroute, anchor)
      // return (mdl.state.route = route)
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
    onmatch: (mdl, args, path, fullroute, anchor) => {
      console.log('path and route', fullroute, anchor)
      // return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: contact,
    route: '/contact',
    position: ['nav', 'footer'],
    group: [],
    children: [],
    onmatch: (mdl, args, path, fullroute, anchor) => {
      console.log('path and route', fullroute, anchor)
      // return (mdl.state.route = route)
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
    onmatch: (mdl, args, path, fullroute, anchor) => {
      console.log('path and route', fullroute, anchor)
      // return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
]

export default Main
