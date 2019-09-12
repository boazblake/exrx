import m from 'mithril'
import { model } from './Model.js'
import App from './App.js'
import { FP } from './Fp/index.js'

// Styles
import './Styles/index.scss'

const root = document.body
let winW = window.innerWidth

if (module.hot) {
  module.hot.accept()
}

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!')
}

const getProfile = (w) => {
  if (w < 668) return 'phone'
  if (w < 920) return 'tablet'
  return 'desktop'
}

const checkWidth = (winW) => {
  const w = window.innerWidth
  if (winW !== w) {
    winW = w
    var lastProfile = model.state.profile
    model.state.profile = getProfile(w)
    if (lastProfile != model.state.profile) m.redraw()
  }
  return requestAnimationFrame(checkWidth)
}

model.state.profile = getProfile(winW)

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('./service-worker.js')
//       .then((registration) => {
//         console.log('🧟 SW registered: ', registration)
//       })
//       .catch((registrationError) => {
//         console.log('⚙️ SW registration failed: ', registrationError)
//       })
//   })
// }

checkWidth(winW)

FP.configure()
window.onscroll = (e) => {
  console.log('SCROLLING', e, window.pageYOffset)
}

m.route(root, '/home', App(model))
