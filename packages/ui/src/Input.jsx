import React from 'react'
import cn from 'classnames'
import classes from './Input.module.css'

const Input = ({ className, light, ...props }) => {
  return (
    <input
      {...props}
      className={cn('input', classes.input, className, {
        [classes.light]: !!light,
      })}
    />
  )
}

export default Input
