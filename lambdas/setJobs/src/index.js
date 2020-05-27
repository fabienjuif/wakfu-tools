import { createClient } from '@fabienjuif/dynamo-client'

const dynamoClient = createClient()

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2))
  const { body } = event
  const { jobs, userId } = JSON.parse(body)

  // TODO: auth
  // TODO: history
  // TODO: control (iterate over jobs)
  await dynamoClient.collection('wakfutools_users').update({
    id: userId,
    jobs,
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(jobs),
  }
}
