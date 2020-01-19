import FormInput from "Components/FormInputs"

const RegisterClientForm = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted, httpError, validate } }) =>
      m("form.column col-6 col-sm-auto", { id: "client-form" }, [
        m(FormInput, {
          isSubmitted,
          validate,
          data,
          errors,
          field: "firstname",
          label: "First Name",
          id: `first-name`,
          type: "text"
        }),
        m(FormInput, {
          isSubmitted,
          validate,
          data,
          errors,
          field: "lastname",
          label: "Last Name",
          id: `last-name`,
          type: "text"
        }),
        m(FormInput, {
          isSubmitted,
          validate,
          data,
          errors,
          field: "email",
          label: "Email",
          id: `email`,
          type: "email"
        }),
        m(FormInput, {
          isSubmitted,
          validate,
          data,
          errors,
          field: "confirmEmail",
          label: "Confirm Email",
          id: `confirm-email`,
          type: "email"
        }),
        m(FormInput, {
          isSubmitted,
          validate,
          data,
          errors,
          field: "birthdate",
          label: "birthdate",
          id: `birthdate`,
          type: "date"
        }),
        httpError && httpError.map((err) => m(".toast toast-error", err))
      ])
  }
}

export default RegisterClientForm
