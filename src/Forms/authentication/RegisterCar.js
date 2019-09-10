import m from 'mithril'

const Car = () => {
  return {
    view: ({
      attrs: {
        data,
        errors,
        getMakes,
        getModels,
        // getVin,
        isSubmitted,
        // isLoading,
      },
    }) =>
      m('.column col-6', [
        // m(
        //   'div.form-group',
        //   m('label.form-switch', [
        //     m('input', {
        //       type: 'checkbox',
        //       onclick: () => {
        //         console.log('wtf', data)
        //         data.findByVin = !data.findByVin
        //       },
        //       checked: data.findByVin,
        //       value: data.findByVin,
        //     }),
        //     m('i.form-icon'),
        //     'Find By VIN',
        //   ])
        // ),

        // !data.findByVin
        //   ?

        [
          // m(
          //   '.toast toast-primary',
          //   { id: 'register-form-toast' },
          //   'Select your vehicle'
          // ),
          m(
            '.form-group ',
            isSubmitted && {
              class: errors.year ? 'has-error' : 'has-success',
            },
            [
              m('label.form-label text-left', { for: 'car-year' }, 'Year'),
              m(
                'select.form-select',
                {
                  id: 'car-year',
                  onchange: (e) => {
                    data.year = e.target.value
                    !data.make && getMakes()
                  },
                  value: data.year,
                },
                data.years.map((year) => m('option.option', year))
              ),
              errors.year && m('p.form-input-hint', errors.year),
            ]
          ),
          data.year &&
            m(
              '.form-group has-icon-right',
              {
                class: isSubmitted && errors.make ? 'has-error' : 'has-success',
              },
              [
                m(
                  'label.form-label text-left',
                  { for: 'reg-make' },
                  'Select Make'
                ),
                data.makes || data.make
                  ? m(
                    'select.form-select',
                    {
                      id: 'reg-make',
                      onchange: (e) => {
                        data.make = e.target.value
                        data.model = undefined
                        !data.model && getModels()
                      },
                      value: data.make,
                    },

                    data.makes &&
                        data.makes.map(({ Make_ID, Make_Name }) =>
                          m('option.option', { value: Make_ID }, Make_Name)
                        )
                  )
                  : m('icon.form-icon loading'),
                errors.make && m('p.form-input-hint', errors.make),
              ]
            ),
          data.make &&
            m(
              '.form-group',
              isSubmitted && {
                class: errors.model ? 'has-error' : 'has-success',
              },
              [
                m(
                  'label.form-label text-left',
                  { for: 'reg-model' },
                  'Select Model'
                ),

                data.models || !data.model
                  ? m(
                    'select.form-select menu',
                    {
                      id: 'reg-model',
                      onchange: (e) => (data.model = e.target.value),
                      value: data.model,
                    },
                    data.models &&
                        data.models.map(({ Model_ID, Model_Name }) =>
                          m(
                            'option.option menu-item',
                            { value: Model_ID },
                            Model_Name
                          )
                        )
                  )
                  : m('icon.form-icon loading'),
                errors.model && m('p.form-input-hint', errors.model),
              ]
            ),
        ],
        // : [
        //   m(
        //     '.toast toast-primary',
        //     { id: 'vin-toast' },
        //     'Find your car by VIN'
        //   ),
        //   m(
        //     '.form-group input-group',
        //     isSubmitted && {
        //       class: errors.vin ? 'has-error' : 'has-success',
        //     },
        //     [
        //       m('label.form-label text-left', { for: 'vin' }),
        //       m('input.form-input', {
        //         id: 'vin',
        //         type: 'text',
        //         placeholder: '5UXWX7C5*BA,2011; 5YJSA3DS*EF ',
        //         onkeyup: (e) => (data.vin = e.target.value),
        //         value: data.vin,
        //       }),
        //       m(
        //         'button.btn btn-primary input-group-btn',
        //         {
        //           onclick: (e) => {
        //             e.preventDefault()
        //             getVin()
        //           },
        //         },
        //         m(`i.icon.icon-search ${isLoading && 'loading'} `)
        //       ),
        //       errors.vin && m('p.form-input-hint', errors.vin),
        //     ]
        //   ),
        // ],
        m(
          '.form-group',
          isSubmitted && {
            class: errors.mileage ? 'has-error' : 'has-success',
          },
          [
            m('label.form-label text-left', { for: 'mileage' }, 'mileage'),
            m('.input-group', [
              m('input.form-input', {
                id: 'mileage',
                type: 'number',
                placeholder: '0000000',
                onkeyup: (e) => (data.mileage = e.target.value),
                value: data.mileage,
              }),
              m('span.input-group-addon', {}, 'MPH'),
            ]),
            errors.mileage && m('p.form-input-hint', errors.mileage),
          ]
        ),
      ]),
  }
}

export default Car
