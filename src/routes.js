import home from './assets/icons/home.js'
import contact from './assets/icons/contact.js'
import services from './assets/icons/services.js'

const Routes = [
  {
    id: 'home',
    title: 'Home',
    icon: home,
    route: '/home',
    group: ['nav'],
  },
  {
    id: 'about',
    title: 'About',
    icon: 'about',
    route: '/about',
    group: ['nav'],
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: contact,
    route: '/contact',
    group: ['nav', 'footer'],
  },
  {
    id: 'services',
    title: 'Services',
    icon: services,
    route: '/services',
    group: ['nav', 'sidebar'],
  },
  {
    id: 'air-conditioning',
    title: 'Air Conditioning',
    icon: 'airconditioning',
    route: '/services/air-conditioning',
    group: ['sidebar'],
  },
  {
    id: 'check-engine-light',
    title: 'Check Engine Light',
    icon: 'checkenginelight',
    route: '/services/check-engine-light',
    group: ['sidebar'],
  },
]

export default Routes
