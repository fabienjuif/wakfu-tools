import React, { useCallback } from 'react'
import cn from 'classnames'
import { MdAddBox } from 'react-icons/md'
import { sortIngredients } from './utils'
import { useShoppingList } from './ShoppingList'
import Ingredient from './Ingredient'
import classes from './Recipe.module.css'

const Recipe = ({
  className,
  item,
  category,
  level,
  ingredients,
  hideTitle,
  factor = 1,
  shopping,
  hideAdd,
  onAdd,
  done,
}) => {
  const { add } = useShoppingList()

  const onAddToShoppingList = useCallback(() => {
    add({ item, level, ingredients, category })
    if (onAdd) onAdd()
  }, [add, category, ingredients, item, level, onAdd])

  return (
    <div
      className={cn('recipe', classes.recipe, className, {
        [classes.done]: done,
      })}
    >
      <div>
        {hideTitle || item.title.fr}
        <div className={cn('job', classes.job)}>
          {category.title.fr}
          lvl {level}
        </div>
        {shopping || hideAdd || (
          <button onClick={onAddToShoppingList}>
            <MdAddBox />
          </button>
        )}
      </div>
      <ul className={cn('ingredients', classes.ingredients)}>
        {sortIngredients(ingredients).map((ingredient) => (
          <li key={ingredient.definition.id}>
            <Ingredient {...ingredient} factor={factor} shopping={shopping} />
            {ingredient.recipe && (
              <Recipe
                className={classes.subRecipe}
                {...ingredient.recipe}
                factor={ingredient.quantity}
                hideTitle
                shopping={shopping}
                hideAdd
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Recipe
