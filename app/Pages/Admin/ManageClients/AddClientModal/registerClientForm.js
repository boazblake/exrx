import FormInput from "Components/FormInputs"

const RegisterClientForm = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted } }) =>
      m(".column col-6", [
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "firstName",
          label: "First Name",
          id: "first-name",
          type: "text"
        }),
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "lastName",
          label: "Last Name",
          id: "last-name",
          type: "text"
        }),
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "email",
          label: "Email",
          id: "email",
          type: "email"
        }),
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "confirmEmail",
          label: "Confirm Email",
          id: "confirm-email",
          type: "email"
        }),
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "birthdate",
          label: "birthdate",
          id: "birthdate",
          type: "date"
        })
      ])
  }
}

export default RegisterClientForm
