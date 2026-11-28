import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import * as persisted from '#/state/persisted'

type StateContext = boolean
type SetContext = (value: boolean) => void

const stateContext = createContext<StateContext>(
  Boolean(persisted.defaults.autoTranslateEnabled),
)
stateContext.displayName = 'AutoTranslateStateContext'
const setContext = createContext<SetContext>((_: boolean) => {})
setContext.displayName = 'AutoTranslateSetContext'

export function Provider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState(
    Boolean(persisted.get('autoTranslateEnabled')),
  )

  const setStateWrapped = useCallback(
    (enabled: persisted.Schema['autoTranslateEnabled']) => {
      setState(Boolean(enabled))
      void persisted.write('autoTranslateEnabled', enabled)
    },
    [],
  )

  useEffect(() => {
    return persisted.onUpdate('autoTranslateEnabled', nextEnabled => {
      setState(Boolean(nextEnabled))
    })
  }, [])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export const useAutoTranslateEnabled = () => useContext(stateContext)
export const useSetAutoTranslateEnabled = () => useContext(setContext)
