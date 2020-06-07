import React, { useState, useCallback } from 'react'
import cn from 'classnames'
import { normalizeStr, useDebounceEvent } from './utils'
import { useWakfuAPI } from './Api'
import Input from './Input'
import Recipe from './Recipe'
import WithWakfuImage from './WithWakfuImage'
import classes from './Items.module.css'

const Items = ({ onRecipeFound }) => {
  const {
    jobsItems,
    recipeIngredients,
    recipes,
    recipeResults,
    recipeCategories,
  } = useWakfuAPI()
  const [filteredItems, setFilteredItems] = useState([])

  const getRecipe = useCallback(
    (item) => {
      if (!item.definition) return undefined

      const recipeResult = recipeResults.find(
        ({ productedItemId }) => productedItemId === item.definition.id,
      )

      if (!recipeResult) return undefined

      const rawRecipe = recipes.find(
        (recipe) => recipe.id === recipeResult.recipeId,
      )

      return {
        ...rawRecipe,
        item,
        category: recipeCategories.find(
          (category) => category.definition.id === rawRecipe.categoryId,
        ),
        ingredients: recipeIngredients
          .filter((ingredient) => ingredient.recipeId === rawRecipe.id)
          .map((ingredient) => {
            const item = jobsItems.find(
              (item) => item.definition.id === ingredient.itemId,
            )

            return { ...ingredient, ...item, recipe: getRecipe(item) }
          }),
      }
    },
    [jobsItems, recipeCategories, recipeIngredients, recipeResults, recipes],
  )

  const [inputValue, setInputValue] = useState('')
  const searchItem = useDebounceEvent(
    (e) => {
      const cleanedInput = normalizeStr(e.target.value)
      if (cleanedInput === '') {
        setFilteredItems([])
        return
      }

      let items = jobsItems
        // match the input search
        .filter((item) =>
          normalizeStr(item.title ? item.title.fr : '').includes(cleanedInput),
        )
        // find associated recipe
        .map((item) => ({ ...item, recipe: getRecipe(item) }))
        // filter item without recipe away
        .filter((item) => !!item.recipe)

      if (items.length > 10) {
        items = items.slice(0, 10).concat({ title: { fr: '...' } })
      }
      setFilteredItems(items)
    },
    200,
    [getRecipe, jobsItems],
  )
  const onFilterItemChange = useCallback(
    (e) => {
      setInputValue(e.target.value)
      searchItem(e)
    },
    [searchItem],
  )

  const [recipe, setRecipe] = useState()

  const onItemClick = useCallback(
    (item) => {
      const recipe = getRecipe(item)
      setRecipe(recipe)
      if (onRecipeFound) onRecipeFound(recipe)
    },
    [getRecipe, onRecipeFound],
  )

  const closePanel = useCallback(() => {
    setInputValue('')
    setFilteredItems([])
    setRecipe(undefined)
  }, [])

  return (
    <div className={cn('items', classes.items)}>
      <Input
        type="text"
        name="filterItem"
        placeholder="Ajouter un item craftable..."
        value={inputValue}
        onChange={onFilterItemChange}
        className={cn('filter', classes.filter)}
      />

      {(filteredItems.length > 0 || recipe) && (
        <div className={cn('panel', classes.panel)}>
          <ul>
            {filteredItems.map((item) => (
              <li
                key={item.definition ? item.definition.id : 'rest'}
                onClick={() => onItemClick(item)}
              >
                <WithWakfuImage {...item} className={cn('item', classes.item)}>
                  {item.title.fr}{' '}
                  {item.definition && ` - ${item.definition.level}`}
                </WithWakfuImage>
              </li>
            ))}
          </ul>

          {recipe && <Recipe {...recipe} onAdd={closePanel} />}
        </div>
      )}
    </div>
  )
}

export default Items
