import fetch from 'node-fetch'
import { createClient } from '@fabienjuif/dynamo-client'

const dynamoClient = createClient()

export const handler = async (event) => {
  // TODO: auth
  const { pathParameters } = event
  const { proxy } = pathParameters

  const res = await fetch(`https://wakfu.cdn.ankama.com/gamedata/${proxy}`)

  return {
    statusCode: res.status,
    headers: {
      ...res.headers,
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    },
    body: await res.text(),
  }
}
