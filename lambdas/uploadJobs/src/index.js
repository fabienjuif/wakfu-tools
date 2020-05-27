import AWS from 'aws-sdk'
import { createClient } from '@fabienjuif/dynamo-client'
import { getJobsLvl } from './getJobsLvl'

const dynamoClient = createClient()

// textract does not exist in euw3
const textract = new AWS.Textract({ region: 'eu-west-2' })

export const handler = async (event) => {
  const { body } = event
  const { bytes, userId } = JSON.parse(body)

  // TODO: auth

  const textractRes = await textract
    // .analyzeDocument({
    //   FeatureTypes: ['TABLES', 'FORMS'],
    .detectDocumentText({
      Document: {
        Bytes: Buffer.from(bytes, 'base64'),
      },
    })
    .promise()

  let { jobs } = getJobsLvl(textractRes)

  const user = await dynamoClient
    .collection('wakfutools_users')
    .get(userId, ['id', 'jobs'])

  // if job already exist and has higher lvl we keep it that way
  if (user.jobs) {
    jobs = jobs.map((newJob) => {
      const oldJob = user.jobs.find((j) => j.code === newJob.code)
      if (!oldJob) return newJob
      if (!oldJob.lvl || oldJob.lvl < newJob.lvl) return newJob
      return oldJob
    })
  }

  // TODO: history
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
