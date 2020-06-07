import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react'
import cn from 'classnames'
import { MdClose } from 'react-icons/md'
import { nanoid } from 'nanoid'
import { sortIngredients } from './utils'
import Card from './Card'
import Button from './Button'
import Recipe from './Recipe'
import Ingredient from './Ingredient'
import Items from './Items'
import WakfuImage from './WakfuImage'
import classes from './ShoppingList.module.css'

const ShoppingListContext = createContext({})

const getBaseIngredients = (recipe, quantity) => {
  if (recipe.done) return []

  return recipe.ingredients.flatMap((ingredient) =>
    ingredient.recipe
      ? getBaseIngredients(ingredient.recipe, ingredient.quantity)
      : {
          ...ingredient,
          done: ingredient.quantity * quantity <= ingredient.availableQuantity,
          quantity: ingredient.quantity * quantity,
        },
  )
}

const mapWithBaseIngredients = (value) => {
  const baseIngredients = new Map()

  value.recipes
    .flatMap((recipe) => getBaseIngredients(recipe, 1))
    .forEach((ingredient) => {
      if (baseIngredients.has(ingredient.itemId)) {
        const old = baseIngredients.get(ingredient.itemId)
        old.quantity += ingredient.quantity
        old.availableQuantity += ingredient.availableQuantity
      } else {
        baseIngredients.set(ingredient.itemId, { ...ingredient })
      }
    })

  return {
    ...value,
    baseIngredients: Array.from(baseIngredients.values()),
  }
}

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
        availableQuantity: 0,
        ingredients: recipe.ingredients.map((ingredient) => ({
          ...addUID(ingredient),
          availableQuantity: 0,
          recipe: ingredient.recipe
            ? mapRecipe(ingredient.recipe, ingredient.quantity)
            : undefined,
        })),
      })

      setValue((old) =>
        mapWithBaseIngredients({
          ...old,
          recipes: old.recipes.concat(mapRecipe(recipe)),
        }),
      )
    },
    markDone: (uid) => {
      setValue((old) => {
        const mapItem = (item, factor = 1, forceDone = false) => {
          const isItem = item.uid === uid
          const done = item.done || isItem || forceDone

          return {
            ...item,
            done,
            ingredients: item.ingredients
              ? item.ingredients.map((ingredient) => ({
                  ...mapItem(ingredient, item.factor, done),
                }))
              : undefined,
            recipe: item.recipe
              ? mapItem(item.recipe, item.factor, done)
              : undefined,
            availableQuantity: done
              ? item.quantity * factor
              : item.availableQuantity,
          }
        }

        return mapWithBaseIngredients({
          ...old,
          recipes: old.recipes
            .map((recipe) =>
              recipe.uid === uid ? undefined : mapItem(recipe, 1, false),
            )
            .filter(Boolean),
        })
      })
    },
    setAvailableQuantity: (uid, quantity) => {
      const setAvailableQuantity = (item, factor, forceDone = false) => {
        const isItem = uid === item.uid

        let done = item.done
        let availableQuantity = item.availableQuantity
        if (forceDone) {
          availableQuantity = item.quantity
          done = true
        } else if (isItem) {
          availableQuantity = +quantity
          done = item.quantity * factor - availableQuantity <= 0
        }

        return {
          ...item,
          availableQuantity,
          done,
          ingredients: item.ingredients
            ? item.ingredients.map((ingredient) =>
                setAvailableQuantity(
                  ingredient,
                  item.factor,
                  forceDone || isItem,
                ),
              )
            : undefined,
          recipe: item.recipe
            ? setAvailableQuantity(
                item.recipe,
                item.factor,
                forceDone || isItem,
              )
            : undefined,
        }
      }

      setValue((old) => {
        return mapWithBaseIngredients({
          ...old,
          recipes: old.recipes
            .map((recipe) => setAvailableQuantity(recipe, false))
            .filter(Boolean),
        })
      })
    },
  })

  // save into and load from localStorage
  const recipesInitialized = useRef(false)
  useEffect(() => {
    const key = 'wakfutools_shoppinglist_recipes'

    // load
    if (!recipesInitialized.current) {
      recipesInitialized.current = true

      setValue((old) =>
        mapWithBaseIngredients({
          ...old,
          recipes: JSON.parse(window.localStorage.getItem(key) || '[]'),
        }),
      )

      return
    }

    // save
    window.localStorage.setItem(key, JSON.stringify(value.recipes))
  }, [value.recipes])

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  )
}

const ShoppingList = () => {
  const { recipes, baseIngredients, markDone } = useShoppingList()

  return (
    <div className={cn('shoppingList', classes.shoppingList)}>
      <Items />

      <div className={cn('baseIngredients', classes.baseIngredients)}>
        {sortIngredients(baseIngredients).map((ingredient) => (
          <Ingredient
            {...ingredient}
            quantity={ingredient.quantity - ingredient.availableQuantity}
            key={ingredient.itemId}
          />
        ))}
      </div>

      <div className={cn('crafts', classes.crafts)}>
        {recipes.map((recipe) => (
          <Card key={recipe.id} className={cn('recipe', classes.recipe)}>
            <Button
              onClick={() => markDone(recipe.uid)}
              className={cn('closeBtn', classes.closeBtn)}
            >
              <MdClose />
            </Button>
            <WakfuImage {...recipe.item} />
            <Recipe {...recipe} shopping />
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ShoppingList
