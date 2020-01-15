const FormInput = {
  view: ({ attrs: { isSubmitted, data, errors, field, label, id, type } }) =>
    m(
      ".form-group ",
      isSubmitted && {
        class: errors[field] ? "has-error" : "has-success"
      },
      [
        m("label.form-label text-left", { id }, [
          label,
          m("span.span required", "*")
        ]),
        m("input.form-input", {
          id,
          type,
          placeholder: label,
          onkeyup: (e) => (data[field] = e.target.value),
          value: data[field],
          autocomplete: false
        }),
        errors[field] && m("p.form-input-hint", errors[field])
      ]
    )
}

export default FormInput
