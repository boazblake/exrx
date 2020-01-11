import Main from "./main.js"
import Authenticated from "./authenticated"
import { flatten } from "ramda"

const Routes = flatten([Main, Authenticated])
export default Routes
