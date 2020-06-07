import React from 'react'
import cn from 'classnames'
import classes from './Button.module.css'

const Button = ({ className, ...props }) => {
  return (
    <button {...props} className={cn('button', classes.button, className)} />
  )
}

export default Button
