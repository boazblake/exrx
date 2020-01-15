import FormInput from "Components/FormInputs"

const RegisterClient = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted } }) =>
      m(".column col-6", [
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "firstname",
          label: "First Name",
          id: "first-name",
          type: "text"
        }),
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "lastname",
          label: "Last Name",
          id: "last-name",
          type: "text"
        }),
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "email",
          label: "email",
          id: "email",
          type: "email"
        }),
        m(FormInput, {
          isSubmitted,
          data,
          errors,
          field: "birthday",
          label: "birthday",
          id: "birthday",
          type: "date"
        })
      ])
  }
}

export default RegisterClient
