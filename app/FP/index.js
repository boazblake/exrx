export * from './all'
export * from './any'
export * from './tuple.js'
export { Coyoneda } from './coyoneda'
export * from './pointfree'
export * from './sum.js'
export * from './list'
export * from './intersection.js'

import { ArrayFP } from './array'
import { Task } from './task'
import { Maybe } from './maybe'
import { Validation } from './validation'

const configure = () => {
  ArrayFP.configure()
  Task.configure()
  Maybe.configure()
  Validation.configure()
}

export const FP = { configure }
