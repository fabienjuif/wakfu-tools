import React, { useCallback, useState, useEffect } from 'react'
import cn from 'classnames'
import { uploadJobs, sortJobs } from './jobs'
import Job from './Job'
import classes from './Player.module.css'

const Player = ({ id, pseudo, jobs, jobFilter, recipeFilter }) => {
  const [error, setError] = useState()
  const [innerJobs, setInnerJobs] = useState([])
  const [shouldSave, setShouldSave] = useState(false)

  useEffect(() => {
    setInnerJobs(sortJobs(jobs))
  }, [jobs, pseudo])

  const jobLvlChange = useCallback((newJob) => {
    setShouldSave(true)
    setInnerJobs((old) =>
      old.map((oldJob) => (oldJob.code === newJob.code ? newJob : oldJob)),
    )
  }, [])

  const onUpload = useCallback(
    async (e) => {
      try {
        setInnerJobs(await uploadJobs(id, e.target.files[0]))
      } catch (ex) {
        setError(ex.message)
      }
    },
    [id],
  )

  const onSave = useCallback(() => {
    fetch(`${process.env.REACT_APP_STAGE}/jobs`, {
      method: 'POST',
      body: JSON.stringify({
        jobs: innerJobs,
        userId: id,
      }),
    }).then(async (raw) => {
      if (!raw.ok) {
        setError(await raw.text())
        return
      }

      setShouldSave(false)
      setInnerJobs((old) => sortJobs(old))
    })
  }, [id, innerJobs])

  return (
    <div className={cn('player', classes.player)}>
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}

      {pseudo}

      <input
        type="file"
        multiple={false}
        accept=".png,.jpg,.jpeg"
        onChange={onUpload}
      />

      <button disabled={!shouldSave} onClick={onSave}>
        Save
      </button>

      <div className={cn('jobs', classes.jobs)}>
        {innerJobs.map((job) => (
          <Job
            {...job}
            key={job.code}
            jobFilter={jobFilter}
            recipeFilter={recipeFilter}
            onChange={jobLvlChange}
          />
        ))}
      </div>
    </div>
  )
}

export default Player
