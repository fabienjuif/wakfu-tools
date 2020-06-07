import React from 'react'
import cn from 'classnames'
import classes from './Input.module.css'

const Input = ({ className, ...props }) => {
  return <input {...props} className={cn('input', classes.input, className)} />
}

export default Input
