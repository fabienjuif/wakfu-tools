import React from 'react'
import cn from 'classnames'
import WakfuImage from './WakfuImage'
import classes from './WithWakfuImage.module.css'

const WithWakfuImage = ({ className, definition, title, children, prefix }) => {
  return (
    <div className={cn('withWakfuImage', classes.withWakfuImage, className)}>
      {prefix}
      {definition && (
        <WakfuImage
          className={cn('image', classes.image)}
          definition={definition}
          title={title}
        />
      )}
      {children}
    </div>
  )
}

export default WithWakfuImage
