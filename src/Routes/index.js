import Main from './main.js'
import Services from './services.js'
import Vendors from './vendors.js'
import { flatten } from 'ramda'

const Routes = flatten([Main, Services, Vendors])
export default Routes
