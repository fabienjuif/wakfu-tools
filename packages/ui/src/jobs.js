import { toBase64 } from './utils'

export const sortJobs = (jobs = []) =>
  [...jobs].sort((a, b) => {
    if (!a.lvl) return 1
    if (!b.lvl) return -1
    return b.lvl - a.lvl
  })

export const uploadJobs = async (userId, file) => {
  const base64 = await toBase64(file)
  const bytes = base64.replace(/.*base64,/, '')

  // TODO: if bytes is more than X MB

  const raw = await fetch(`${process.env.REACT_APP_STAGE}/jobs/upload`, {
    method: 'POST',
    body: JSON.stringify({
      bytes,
      userId,
    }),
  })

  if (!raw.ok) throw new Error(await raw.text())

  return sortJobs(await raw.json())
}
