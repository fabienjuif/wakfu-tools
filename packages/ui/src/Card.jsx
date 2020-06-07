import React from 'react'
import cn from 'classnames'
import classes from './Card.module.css'

const Card = ({ className, ...props }) => {
  return <div className={cn('card', classes.card, className)} {...props} />
}

export default Card
