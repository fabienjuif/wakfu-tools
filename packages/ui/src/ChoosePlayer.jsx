import React, { useState, useEffect, useRef, useCallback } from 'react'
import cn from 'classnames'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { toBase64 } from './utils'
import classes from './ChoosePlayer.module.css'

const ChoosePlayer = ({ players, onClick, imagePreview }) => {
  const [preview, setPreview] = useState()
  const cropper = useRef()

  useEffect(() => {
    if (!imagePreview) return

    // the first version works better on firefox
    // the catch version works better on chromium
    try {
      setPreview(URL.createObjectURL(imagePreview))
    } catch (ex) {
      toBase64(imagePreview).then(setPreview)
    }
  }, [imagePreview])

  const innerOnClick = useCallback(
    (playerId) => {
      cropper.current.getCroppedCanvas().toBlob(async (blob) => {
        if (onClick)
          onClick({
            playerId,
            image: blob,
          })
      })
    },
    [onClick],
  )

  if (!preview) return null

  return (
    <div className={cn('choosePlayer', classes.choosePlayer)}>
      <div className={cn('preview', classes.preview)}>
        <img
          src={preview}
          alt="preview"
          ref={(elm) => {
            if (!elm) return
            if (cropper.current) return

            cropper.current = new Cropper(elm, {
              viewMode: 1,
              autoCrop: true,
              autoCropArea: 0.2,
              cropBoxMovable: false,
              cropBoxResizable: false,
              background: false,
              zoomable: false,
            })
          }}
        />
      </div>
      <div className={cn('players', classes.players)}>
        {players.map((player) => (
          <button key={player.id} onClick={() => innerOnClick(player.id)}>
            {player.pseudo}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChoosePlayer
