import { useCallback, useLayoutEffect, useRef } from 'react'
import { deburr, debounce } from 'lodash'

export const normalizeStr = (str) => deburr(str).trim().toLowerCase()

export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

export const sortIngredients = (ingredients) =>
  [...ingredients].sort((a, b) => {
    if (a.done) return 1
    if (b.done) return -1
    return 0
  })

export const useDebounceEvent = (callback, time, deps) => {
  const debouncedFn = useRef(debounce(callback, time))

  useLayoutEffect(() => {
    debouncedFn.current = debounce(callback, time)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, time])

  return useCallback((event) => {
    event.persist()

    return debouncedFn.current(event)
  }, [])
}
