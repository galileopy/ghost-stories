import React, { Component } from 'react'


export default class FieldRender extends Component {
  render() {
    const {
      field, Editing, Saving, ReadOnly, Error, handlers,
      props,
    } = this.props

    return field
      .matchWith({
        Editable({ value, temp }) {
          return <Editing value={value} temp={temp} handlers={handlers} {...props} />
        },
        ReadOnly({ value }) {
          return <ReadOnly value={value} handlers={handlers} {...props} />
        },
        Saving({ value }) {
          return <Saving value={value} handlers={handlers} {...props} />
        },
        Error({ messages, value, temp }) {
          return (
            <Error
              value={value}
              temp={temp}
              handlers={handlers}
              error
              messages={messages}
              {...props}
            />
          )
        },
      })
  }
}
