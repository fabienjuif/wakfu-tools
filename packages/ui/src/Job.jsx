import React, { useCallback, useRef, useEffect } from 'react'
import cn from 'classnames'
import { normalizeStr } from './utils'
import classes from './Job.module.css'

const Job = ({ code, jobFilter, lvl, onChange }) => {
  const inputRef = useRef()
  const innerOnChange = useCallback(
    (e) => {
      if (onChange) onChange({ code, lvl: +e.target.value })
    },
    [code, onChange],
  )

  useEffect(() => {
    if (!lvl) {
      inputRef.current.value = ''
    }
  }, [lvl])

  const sameJob = !jobFilter || normalizeStr(code).includes(jobFilter)

  return (
    <div
      key={code}
      className={cn('job', classes.job, {
        [classes.filter]: jobFilter,
        [classes.show]: sameJob,
      })}
    >
      <div>{code}</div>
      <input
        ref={inputRef}
        className={cn('lvl', classes.lvl)}
        value={lvl}
        onChange={innerOnChange}
        type="number"
      />
    </div>
  )
}

export default Job
