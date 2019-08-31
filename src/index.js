import m from 'mithril'
import { model } from './Model.js'
import App from './App.js'

const root = document.body

if (module.hot) {
  module.hot.accept()
}

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!')
}

function getProfile(w) {
  if (w < 668) return 'phone'
  if (w < 920) return 'tablet'
  return 'desktop'
}

// Styles
import './styles/index.scss'
import './styles/animations.css'
import './styles/loader.scss'

let winW = window.innerWidth
model.state.profile = getProfile(winW)

function checkWidth() {
  const w = window.innerWidth
  if (winW !== w) {
    winW = w
    var lastProfile = model.state.profile
    model.state.profile = getProfile(w)
    if (lastProfile != model.state.profile) m.redraw()
  }
  requestAnimationFrame(checkWidth)
}

checkWidth()

m.route(root, '/home', App(model))
