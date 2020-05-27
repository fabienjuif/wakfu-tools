import React, { useEffect, useState, createContext, useContext } from 'react'

const REACT_APP_API_WAKFU =
  process.env.REACT_APP_API_WAKFU ||
  'https://86b15ggg43.execute-api.eu-west-3.amazonaws.com/dev/wakfu'

const APIContext = createContext()

const getData = async (name, version) => {
  const itemKey = `wakfutools_${name}`
  let item = window.localStorage.getItem(itemKey)
  if (item) item = JSON.parse(item)

  if (!item || item.version !== version) {
    const data = await fetch(
      `${REACT_APP_API_WAKFU}/${version}/${name}.json`,
    ).then((raw) => raw.json())

    window.localStorage.setItem(itemKey, JSON.stringify({ version, data }))
    return data
  }

  return item.data
}

export const WakfuAPIProvider = ({ children }) => {
  const [value, setValue] = useState({
    jobsItems: [],
    recipeResults: [],
    recipeIngredients: [],
    recipes: [],
    recipeCategories: [],
  })

  useEffect(() => {
    // getting the latest version id
    fetch(`${REACT_APP_API_WAKFU}/config.json`)
      .then((raw) => raw.json())
      .then(async ({ version }) => {
        const [
          jobsItems,
          recipeResults,
          recipeIngredients,
          recipes,
          recipeCategories,
        ] = await Promise.all(
          [
            'jobsItems',
            'recipeResults',
            'recipeIngredients',
            'recipes',
            'recipeCategories',
          ].map((name) => getData(name, version)),
        )

        setValue((old) => ({
          ...old,
          jobsItems,
          recipeResults,
          recipeIngredients,
          recipes,
          recipeCategories,
        }))
      })
  }, [])

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>
}

export const useWakfuAPI = () => useContext(APIContext)
