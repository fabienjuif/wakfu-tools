import React, { useCallback } from 'react'
import cn from 'classnames'
import { MdReplay, MdCheck } from 'react-icons/md'
import { useShoppingList } from './ShoppingList'
import WithWakfuImage from './WithWakfuImage'
import classes from './Ingredient.module.css'

const Ingredient = ({
  uid,
  factor = 1,
  quantity,
  availableQuantity,
  definition,
  title,
  shopping,
  done,
}) => {
  const { setAvailableQuantity, markDone } = useShoppingList()

  const onQuantityChange = useCallback(
    (e) => {
      setAvailableQuantity(uid, e.target.value)
    },
    [setAvailableQuantity, uid],
  )

  const onDone = useCallback(() => {
    markDone(uid)
  }, [markDone, uid])

  return (
    <WithWakfuImage
      className={cn('ingredient', classes.ingredient, { [classes.done]: done })}
      definition={definition}
      title={title}
    >
      {shopping && (
        <>
          <button onClick={onDone}>
            <MdCheck />
          </button>
          <button onClick={() => alert('TODO:')}>
            <MdReplay />
          </button>
        </>
      )}
      <div className={cn('quantity', classes.quantity)}>
        {quantity * factor}
      </div>
      {shopping && (
        <input
          className={cn('availableQuantity', classes.availableQuantity)}
          type="number"
          onChange={onQuantityChange}
          value={availableQuantity || 0}
          max={quantity * factor}
          min={0}
        />
      )}
      {factor > 1 && (
        <div className={cn('formula', classes.formula)}>
          {quantity}
          {' x '}
          {factor}
        </div>
      )}
      <div className={cn('title', classes.title)}>{title.fr}</div>
    </WithWakfuImage>
  )
}

export default Ingredient
