import Splash from "./splash.js"
import Authenticated from "./authenticated"
import { flatten } from "ramda"

const Routes = flatten([Splash, Authenticated])
export default Routes
