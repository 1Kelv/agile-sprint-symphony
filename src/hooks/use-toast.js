
import * as React from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toasts = new Map()

const listeners = new Set()

function emitChange() {
  listeners.forEach((listener) => {
    listener()
  })
}

function toast({
  title,
  description,
  type,
  duration = 5000,
  ...props
}) {
  const id = genId()

  const update = (props) =>
    dispatch({
      ...props,
      id,
    })

  const dismiss = () => dispatch({ id })

  dispatch({
    id,
    title,
    description,
    type,
    duration,
    ...props,
  })

  return {
    id,
    dismiss,
    update,
  }
}

function dispatch(action) {
  if (action.id) {
    if (action.id && !action.title && !action.description) {
      toasts.delete(action.id)
      emitChange()
      return
    }

    toasts.set(action.id, {
      ...action,
      createdAt: Date.now(),
    })
    emitChange()
    return
  }
}

function useToast() {
  const [state, setState] = React.useState(toasts)

  React.useEffect(() => {
    function onToastsChange() {
      setState(new Map(toasts))
    }

    listeners.add(onToastsChange)
    return () => {
      listeners.delete(onToastsChange)
    }
  }, [])

  return {
    toasts: Array.from(state.values()),
    toast,
  }
}

export { toast, useToast }
