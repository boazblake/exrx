import m from 'mithril'
import { model } from './Model.js'
import App from './App.js'
import { checkWidth, getProfile } from 'utils/helpers'

// Styles
import './styles/index.scss'

const root = document.body
let winW = window.innerWidth
model.state.profile = getProfile(winW)

if (module.hot) {
  module.hot.accept()
}

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!')
}

checkWidth(winW)

m.route(root, '/home', App(model))
