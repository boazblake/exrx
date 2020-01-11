import Main from './main.js'
import Services from './services.js'
import Authenticated from './authenticated'
import Vendors from './vendors.js'
import Splash from './splash.js'
import { flatten } from 'ramda'

const Routes = flatten([Main, Services, Vendors, Splash, Authenticated])
export default Routes
