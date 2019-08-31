import home from './assets/icons/home.js'
import contact from './assets/icons/contact.js'
import services from './assets/icons/services.js'

import Layout from './Layout.js'
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'

const Routes = [
  {
    id: 'home',
    title: 'Home',
    icon: home,
    route: '/home',
    position: ['nav'],
    group: [],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Home, { mdl })),
  },
  {
    id: 'about',
    title: 'About',
    icon: 'about',
    route: '/about',
    position: ['nav'],
    group: [],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(About, { mdl })),
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: contact,
    route: '/contact',
    position: ['nav', 'footer'],
    group: [],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Contact, { mdl })),
  },
  {
    id: 'services',
    title: 'Services',
    icon: services,
    route: '/services',
    position: ['nav', 'sidebar'],
    group: ['services'],
    children: ['air-conditioning', 'check-engine-light'],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Contact, { mdl })),
  },
  {
    id: 'air-conditioning',
    title: 'Air Conditioning',
    icon: 'airconditioning',
    route: '/services/air-conditioning',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Contact, { mdl })),
  },
  {
    id: 'check-engine-light',
    title: 'Check Engine Light',
    icon: 'checkenginelight',
    route: '/services/check-engine-light',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Contact, { mdl })),
  },
]

export default Routes
