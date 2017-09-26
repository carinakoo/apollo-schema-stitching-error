import {
  makeRemoteExecutableSchemaByIntrospection,
  mergeSchemas
} from 'graphql-tools'
// import { execute, makePromise } from 'apollo-link'
// import HttpLink from 'apollo-link-http'
import { createApolloFetch } from 'apollo-fetch'

async function Go() {
  /*
  const PropertyLink = new HttpLink({
    uri: 'https://v7l45qkw3.lp.gql.zone/graphql'
  })
  const PropertySchema = await makeRemoteExecutableSchemaByIntrospection(
    operation => makePromise(execute(PropertyLink, operation))
  )

  const BookingLink = new HttpLink({
    uri: 'https://41p4j4309.lp.gql.zone/graphql'
  })
  const BookingSchema = await makeRemoteExecutableSchemaByIntrospection(
    operation => makePromise(execute(BookingLink, operation))
  )
  */

  const PropertySchema = await makeRemoteExecutableSchemaByIntrospection(
    createApolloFetch({
      uri: 'https://v7l45qkw3.lp.gql.zone/graphql'
    })
  )

  const BookingSchema = await makeRemoteExecutableSchemaByIntrospection(
    createApolloFetch({
      uri: 'https://41p4j4309.lp.gql.zone/graphql'
    })
  )

  const LinkSchema = `
  extend type Booking {
    property: Property
  }

  extend type Property {
    bookings(limit: Int): [Booking]
  }
`

  const mergedSchema = mergeSchemas({
    schemas: [PropertySchema, BookingSchema, LinkSchema],
    // onTypeConflict: (leftType, rightType) => leftType,
    onTypeConflict: (leftType, rightType) => rightType,
    resolvers: mergeInfo => ({
      Property: {
        bookings: {
          fragment: 'fragment PropertyFragment on Property { id }',
          resolve(parent, args, context, info) {
            return mergeInfo.delegate(
              'query',
              'bookingsByPropertyId',
              {
                propertyId: parent.id,
                limit: args.limit ? args.limit : null
              },
              context,
              info
            )
          }
        }
      },
      Booking: {
        property: {
          fragment: 'fragment BookingFragment on Booking { propertyId }',
          resolve(parent, args, context, info) {
            return mergeInfo.delegate(
              'query',
              'propertyById',
              {
                id: parent.propertyId
              },
              context,
              info
            )
          }
        }
      }
    })
  })

  console.log(mergedSchema)
}

Go()
