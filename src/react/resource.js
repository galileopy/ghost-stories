import React, { Component } from 'react'

const merge = (obj1, obj2) => Object.assign({}, obj1, obj2)


export default class ResourceRender extends Component {
  render() {
    const {
      resource, Data, Query, Empty, Error, handlers, props,
      matchingProps,
    } = this.props
    const specific = matchingProps || {
      Data: {}, Query: {}, Empty: {}, Error: {},
    }

    if (typeof resource.matchWith !== 'function') return null

    return resource
      .matchWith({
        Query() {
          return <Query {...merge(props, specific.Query)} />
        },
        Empty({ meta, params }) {
          return (
            <Empty
              meta={meta}
              params={params}
              resource={resource}
              {...merge(props, specific.Empty)}
              // estos dos pueden salir de aca y pasarse como props
              show
              messages={['No se obtuvieron resultados']}
            />
          )
        },
        Data({ value, meta, params }) {
          return (
            <Data
              resource={resource}
              value={value}
              meta={meta}
              params={params}
              handlers={handlers}
              {...merge(props, specific.Data)}
            />)
        },
        Error({ messages, meta, params }) {
          return (
            <Error
              meta={meta}
              param={params}
              messages={messages}
              show
              error
              {...merge(props, specific.Error)}
            />)
        },
      })
  }
}
