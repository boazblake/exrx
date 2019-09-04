import { curryN, identity, lensProp, mergeAll } from 'ramda'
import { Success } from 'data.validation'
import { validate, log } from 'utils'

const isEmpty = (d) => {
  console.log('is this working', d)
  return d
}

const Validator = Success(curryN(1, identity))

export const nameLense = lensProp('data')

export const ATTRS_REQUIRED_MSG =
  'The name you want us to call you by is needed'

export const validateName = (data) => {
  console.log('heyyy', Success)

  return Success(data).apLeft(
    validate(isEmpty, nameLense, ATTRS_REQUIRED_MSG, data)
  )
}

export const validationsTask = (data) =>
  Validator.ap(validateName({ name: data.name() }))
    .failureMap(mergeAll)
    .map(log('wtf'))
    .toTask()
