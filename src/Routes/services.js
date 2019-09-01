import Layout from '../Layout.js'
import Default from '../Pages/Default'
import AirConditioning from '../Pages/Services/AirConditioning.js'
import { flatten } from 'ramda'

const AirConditioningRoutes = [
  {
    id: 'service-maintenance',
    title: 'Air Conditioning - Service & Maintenance',
    icon: 'airconditioning',
    route: '/services/air-conditioning/#service-maintenance',
    position: ['sidebar'],
    group: ['air-conditioning'],
    children: [],
    // onmatch: (mdl, props, route) => {
    // console.log('props', props)
    // return (mdl.state.route = route)
    // },
    // component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'help-over-heating',
    title: 'Air Conditioning - Help! OverHeating',
    icon: 'airconditioning',
    route: '/services/air-conditioning/#help-over-heating',
    position: ['sidebar'],
    group: ['air-conditioning'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(AirConditioning, { mdl })),
  },
  {
    id: 'ac-video',
    title: 'Air Conditioning - Video',
    icon: 'airconditioning',
    route: '/services/air-conditioning/#help-over-heating',
    position: ['sidebar'],
    group: ['air-conditioning'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(AirConditioning, { mdl })),
  },
  {
    id: 'ac-parts',
    title: 'Air Conditioning - Parts',
    icon: 'airconditioning',
    route: '/services/air-conditioning/#ac-parts',
    position: ['sidebar'],
    group: ['air-conditioning'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(AirConditioning, { mdl })),
  },
  {
    id: 'ac-testing-fees',
    title: 'Air Conditioning - Testing Fees',
    icon: 'airconditioning',
    route: '/services/air-conditioning/#ac-testing-fees',
    position: ['sidebar'],
    group: ['air-conditioning'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(AirConditioning, { mdl })),
  },
]

const SubMenu = [
  {
    id: 'alignment',
    title: 'Alignment',
    icon: 'alignment',
    route: '/services/alignment',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
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
    component: (mdl) => m(Layout, { mdl }, m(AirConditioning, { mdl })),
  },
  {
    id: 'battery',
    title: 'Battery',
    icon: 'battery',
    route: '/services/battery',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'belts',
    title: 'Belts',
    icon: 'belts',
    route: '/services/belts',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'brakes',
    title: 'Brakes',
    icon: 'brakes',
    route: '/services/brakes',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
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
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'clutch',
    title: 'Clutch',
    icon: 'clutch',
    route: '/services/clutch',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'cooling-system',
    title: 'Cooling System',
    icon: 'coolingsystem',
    route: '/services/cooling-system',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'drive-train',
    title: 'Drivetrain',
    icon: 'drivetrain',
    route: '/services/drive-train',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'engine-remanufactured',
    title: 'Engine Remanufactured',
    icon: 'engineremanufactured',
    route: '/services/engine-remanufactured',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'exhuast-emissions',
    title: 'Exhaust & Emissions',
    icon: 'exhuastemissions',
    route: '/services/exhuast-emissions',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'exterior-repair',
    title: 'Exterior Repair',
    icon: 'exteriorrepair',
    route: '/services/exterior-repair',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'filters',
    title: 'Filters',
    icon: 'filters',
    route: '/services/filters',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'flood-repair',
    title: 'Flood Repair',
    icon: 'floodrepair',
    route: '/services/flood-repair',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'fuel-system',
    title: 'Fuel System',
    icon: 'fuelsystem',
    route: '/services/fuel-system',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'hoses',
    title: 'Hoses',
    icon: 'hoses',
    route: '/services/hoses',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'ignition',
    title: 'Ignition',
    icon: 'ignition',
    route: '/services/ignition',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'inspections',
    title: 'Inspections',
    icon: 'inspections',
    route: '/services/inspections',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'interior-repairs',
    title: 'Interior Repairs',
    icon: 'interiorrepairs',
    route: '/services/interior-repairs',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    icon: 'maintenance',
    route: '/services/maintenance',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'oil-change',
    title: 'Oil Change',
    icon: 'oilchange',
    route: '/services/oil-change',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'timing-belt',
    title: 'Timing Belt',
    icon: 'timingbelt',
    route: '/services/timing-belt',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'tire-management',
    title: 'Tire Management',
    icon: 'tiremanagement',
    route: '/services/tire-management',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'starting-charging',
    title: 'Starting Charging',
    icon: 'startingcharging',
    route: '/services/starting-charging',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'steering',
    title: 'Steering',
    icon: 'steering',
    route: '/services/steering',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'suspension',
    title: 'Suspension',
    icon: 'suspension',
    route: '/services/suspension',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'transmission-remanufactured',
    title: 'Transmission Remanufactured',
    icon: 'transmissionremanufactured',
    route: '/services/transmission-remanufactured',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
  {
    id: 'window-repairs',
    title: 'Window Repairs',
    icon: 'windowrepairs',
    route: '/services/window-repairs',
    position: ['sidebar'],
    group: ['services'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
]

const Services = flatten([SubMenu, AirConditioningRoutes])

export default Services
