import { MainLayout } from '../Layouts/index.js'
import Default from '../Pages/Default'
// import { flatten } from 'ramda'

const BGProducts = [
  {
    id: 'bg-products',
    title: 'BG Products',
    icon: 'bgproducts',
    route: '/vendors/bg-products',
    position: ['sidebar'],
    group: ['vendors'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-fuel-Air-induction-service',
    title: 'BG Products Fuel/Air Induction Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-fuel-Air-induction-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-lubrication-fuel-service',
    title: 'BG Products Lubrication + Fuel Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-lubrication-fuel-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-cooling-system-service',
    title: 'BG Products Cooling System Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-cooling-system-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-transmission-service',
    title: 'BG Products Transmission Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-transmission-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-drive-line',
    title: 'BG Products Drive Line',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-drive-line',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-break-service',
    title: 'BG Products Break Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-break-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-climate-control-service',
    title: 'BG Products Climate Control Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-climate-control-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-battery-service',
    title: 'BG Products Battery Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-battery-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-power-steering-service',
    title: 'BG Products Power Steering Service',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-power-steering-service',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'bg-products-ethanol-fuel-system-defender',
    title: 'BG Products Ethanol Fuel System Defender',
    icon: 'bgproducts',
    route: '/vendors/bg-products/#bg-products-ethanol-fuel-system-defender',
    position: ['sidebar'],
    group: ['bg-products'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(MainLayout, { mdl }, m(Default, { mdl })),
  },
]

const Vendors = BGProducts

export default Vendors
