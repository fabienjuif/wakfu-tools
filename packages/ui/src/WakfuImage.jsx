import React from 'react'

const WakfuImage = ({ className, definition, title }) => {
  return (
    <img
      className={className}
      src={`https://d2tb98fxsa1qbz.cloudfront.net/wakfu/portal/game/item/115/${definition.graphicParameters.gfxId}.png`}
      alt={title.fr}
    />
  )
}

export default WakfuImage
