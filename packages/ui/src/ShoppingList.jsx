import React, { createContext, useState, useContext, useEffect } from 'react'
import cn from 'classnames'
import { nanoid } from 'nanoid'
import { sortIngredients } from './utils'
import Recipe from './Recipe'
import Ingredient from './Ingredient'
import WakfuImage from './WakfuImage'
import classes from './ShoppingList.module.css'

const ShoppingListContext = createContext({})

export const useShoppingList = () => useContext(ShoppingListContext)

export const ShoppingListProvider = ({ children }) => {
  const [value, setValue] = useState({
    recipes: [],
    baseIngredients: [],
    add: (recipe) => {
      const addUID = (obj) => ({ ...obj, uid: nanoid() })
      const mapRecipe = (recipe, factor = 1) => ({
        ...addUID(recipe),
        factor,
        ingredients: recipe.ingredients.map((ingredient) => ({
          ...addUID(ingredient),
          recipe: ingredient.recipe
            ? mapRecipe(ingredient.recipe, ingredient.quantity)
            : undefined,
        })),
      })

      setValue((old) => ({
        ...old,
        recipes: old.recipes.concat(mapRecipe(recipe)),
      }))
    },
    markDone: (uid) => {
      setValue((old) => {
        const mapIngredient = (ingredient, recipe, forceDone = false) => {
          const isItem = ingredient.uid === uid

          return {
            ...ingredient,
            done: ingredient.done || isItem || forceDone,
            availableQuantity: isItem
              ? ingredient.quantity * recipe.factor
              : ingredient.availableQuantity,
          }
        }

        const mapRecipe = (recipe, forceDone = false) => {
          return {
            ...recipe,
            done: recipe.done || recipe.uid === uid || forceDone,
            ingredients: recipe.ingredients.map((ingredient) => ({
              ...mapIngredient(ingredient, recipe, forceDone),
              recipe: ingredient.recipe
                ? mapRecipe(ingredient.recipe, recipe.uid === uid || forceDone)
                : undefined,
            })),
          }
        }

        return {
          ...old,
          recipes: old.recipes
            .map((recipe) =>
              recipe.uid === uid ? undefined : mapRecipe(recipe, false),
            )
            .filter(Boolean),
        }
      })
    },
    setAvailableQuantity: (uid, quantity) => {
      const setAvailableQuantity = (item, forceDone = false) => {
        const isItem = uid === item.uid

        let done = item.done
        let availableQuantity = item.availableQuantity
        if (forceDone) {
          availableQuantity = item.quantity
          done = true
        } else if (isItem) {
          availableQuantity = quantity
          done = item.quantity - quantity <= 0
        }

        return {
          ...item,
          availableQuantity,
          done,
          ingredients: item.ingredients
            ? item.ingredients.map((ingredient) =>
                setAvailableQuantity(ingredient, forceDone || isItem),
              )
            : undefined,
          recipe: item.recipe
            ? setAvailableQuantity(item.recipe, forceDone || isItem)
            : undefined,
        }
      }

      setValue((old) => {
        return {
          ...old,
          recipes: old.recipes
            .map((recipe) => setAvailableQuantity(recipe, false))
            .filter(Boolean),
        }
      })
    },
  })

  // this effect listen to recipes and create the base ingredients
  useEffect(() => {
    const getBaseIngredients = (recipe, quantity) => {
      if (recipe.done) return []

      return recipe.ingredients.flatMap((ingredient) =>
        ingredient.recipe
          ? getBaseIngredients(ingredient.recipe, ingredient.quantity)
          : {
              ...ingredient,
              quantity: ingredient.quantity * quantity,
            },
      )
    }

    setValue((old) => ({
      ...old,
      baseIngredients: old.recipes
        .flatMap((recipe) => getBaseIngredients(recipe, 1))
        .reduce((baseIngredients, ingredient) => {
          const old = baseIngredients.find(
            (b) => b.itemId === ingredient.itemId,
          )
          if (!old) return [...baseIngredients, { ...ingredient }]

          old.quantity += ingredient.quantity
          if (ingredient.availableQuantity) {
            old.availableQuantity =
              (old.availableQuantity || 0) + ingredient.availableQuantity

            old.done = old.quantity - old.availableQuantity <= 0
          }
          return baseIngredients
        }, []),
    }))
  }, [value.recipes])

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  )
}

const ShoppingList = () => {
  const { recipes, baseIngredients } = useShoppingList()

  return (
    <div className={cn('shoppingList', classes.shoppingList)}>
      {recipes.map((recipe) => (
        <div key={recipe.id} className={cn('recipe', classes.recipe)}>
          <WakfuImage {...recipe.item} />
          <Recipe {...recipe} shopping />
        </div>
      ))}

      <div className={cn('baseIngredients', classes.baseIngredients)}>
        {sortIngredients(baseIngredients).map((ingredient) => (
          <Ingredient
            {...ingredient}
            quantity={ingredient.quantity - (ingredient.availableQuantity || 0)}
          />
        ))}
      </div>
    </div>
  )
}

export default ShoppingList
