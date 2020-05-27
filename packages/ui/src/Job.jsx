import React, { useCallback, useRef, useEffect } from 'react'
import cn from 'classnames'
import { normalizeStr } from './utils'
import classes from './Job.module.css'

const Job = ({ code, jobFilter, recipeFilter, lvl, onChange }) => {
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

  const sameJob =
    (!jobFilter && !recipeFilter) ||
    normalizeStr(code).includes(jobFilter) ||
    (recipeFilter && code === recipeFilter.category.title.fr)

  return (
    <div
      key={code}
      className={cn('job', classes.job, {
        [classes.filter]: jobFilter || recipeFilter,
        [classes.show]: sameJob,
        [classes.underLevel]:
          recipeFilter && (!lvl || recipeFilter.level > lvl),
        [classes.overLevel]: recipeFilter && recipeFilter.level <= lvl,
      })}
    >
      <div>{code}</div>
      {sameJob &&
        recipeFilter &&
        recipeFilter.level <= lvl &&
        recipeFilter.level > lvl - 19 && <div>+XP</div>}
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
