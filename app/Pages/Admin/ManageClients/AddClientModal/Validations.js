import { curryN, identity, lensProp, mergeAll } from "ramda"
import { Success } from "data.validation"
import { validate, isRequired, emailFormat } from "Utils"

const ValidateRegistration = Success(curryN(2, identity))

const nameLense = lensProp("name")
const emailLense = lensProp("email")
const emailConfirmLense = lensProp("confirmEmail")

const NAME_REQUIRED_MSG = "A Name is required"
const EMAIL_REQUIRED_MSG = "An Email is required"
const EMAILS_MUST_MATCH = "Emails do not match"
const INVALID_EMAIL_FORMAT = "Email must be a valid format"

const inputsMatch = (input1) => (input2) => input2 === input1

const validateName = (data) =>
  Success(data).apLeft(validate(isRequired, nameLense, NAME_REQUIRED_MSG, data))

const validateEmails = (data) =>
  Success(data)
    .apLeft(validate(isRequired, emailLense, EMAIL_REQUIRED_MSG, data))
    .apLeft(validate(isRequired, emailConfirmLense, EMAIL_REQUIRED_MSG, data))
    .apLeft(
      validate(
        inputsMatch(data.confirmEmail),
        emailLense,
        EMAILS_MUST_MATCH,
        data
      )
    )
    .apLeft(
      validate(
        inputsMatch(data.email),
        emailConfirmLense,
        EMAILS_MUST_MATCH,
        data
      )
    )
    .apLeft(
      validate(emailFormat, emailConfirmLense, INVALID_EMAIL_FORMAT, data)
    )
    .apLeft(validate(emailFormat, emailLense, INVALID_EMAIL_FORMAT, data))

export const validateClientRegistrationTask = (data) => {
  console.log(data)
  return (
    ValidateRegistration.ap(validateName(data))
      .ap(validateEmails(data))
      // .ap(validateBirthday(data))
      .failureMap(mergeAll)
      .toTask()
  )
}
