import React from 'react'
import cn from 'classnames'
import classes from './Screen.module.css'

const Screen = ({ children }) => {
  return <div className={cn('screen', classes.screen)}>{children}</div>
}

export default Screen
