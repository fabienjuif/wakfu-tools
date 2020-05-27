import { createClient } from '@fabienjuif/dynamo-client'

const dynamoClient = createClient()

export const handler = async (event) => {
  // TODO: auth
  // TODO: team support (request per team not ALL users)

  const { Items: users } = await dynamoClient.docClient
    .scan({ TableName: 'wakfutools_users' })
    .promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(users),
  }
}
