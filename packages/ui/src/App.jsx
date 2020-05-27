import React, { useState, useEffect, useCallback } from 'react'
import cn from 'classnames'
import { normalizeStr } from './utils'
import { uploadJobs } from './jobs'
import ChoosePlayer from './ChoosePlayer'
import ShoppingList, { ShoppingListProvider } from './ShoppingList'
import classes from './App.module.css'
import Player from './Player'
import Items from './Items'

const App = () => {
  const [jobFilter, setJobFilter] = useState(undefined)
  const [recipeFilter, setRecipeFilter] = useState(undefined)
  const [error, setError] = useState()
  const [players, setPlayers] = useState([])
  const [waitingFile, setWaitingFile] = useState()

  useEffect(() => {
    // TODO: rename REST resource
    fetch(`${process.env.REACT_APP_STAGE}/users`).then(async (raw) => {
      if (!raw.ok) {
        setError(await raw.text())
        return
      }

      const players = await raw.json()
      setPlayers(players)
    })
  }, [])

  const onChangeFilter = useCallback((e) => {
    const filter = normalizeStr(e.target.value)
    if (filter.length <= 0) {
      setJobFilter(undefined)
      return
    }

    setJobFilter(filter)
  }, [])

  useEffect(() => {
    document.onpaste = async (event) => {
      const files = (event.clipboardData || event.originalEvent.clipboardData)
        .items

      const [file] = files
      if (file.kind !== 'file' && !file.type.startsWith('image')) return

      setWaitingFile(file.getAsFile())
    }

    return () => {
      document.onpaste = undefined
    }
  }, [])

  const onPlayerChosen = useCallback(async ({ playerId, image }) => {
    try {
      const jobs = await uploadJobs(playerId, image)
      setPlayers((old) =>
        old.map((oldPlayer) =>
          oldPlayer.id === playerId ? { ...oldPlayer, jobs } : oldPlayer,
        ),
      )
    } catch (ex) {
      setError(ex.message)
    }

    setWaitingFile(undefined)
  }, [])

  return (
    <div>
      {waitingFile && (
        <ChoosePlayer
          onClick={onPlayerChosen}
          players={players}
          imagePreview={waitingFile}
        />
      )}
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}

      <input
        type="text"
        name="filterJob"
        placeholder="Filtre métier"
        onChange={onChangeFilter}
      />

      <div className={cn('players', classes.players)}>
        {players &&
          players.map((player) => (
            <Player
              key={player.id}
              {...player}
              jobFilter={jobFilter}
              recipeFilter={recipeFilter}
            />
          ))}
      </div>

      <ShoppingListProvider>
        <Items onRecipeFound={setRecipeFilter} />

        <ShoppingList />
      </ShoppingListProvider>
    </div>
  )
}

export default App
