import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener("change", onStoreChange)
      return () => mql.removeEventListener("change", onStoreChange)
    },
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}

export function useIsLarge() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia("(min-width: 1024px)")
      mql.addEventListener("change", onStoreChange)
      return () => mql.removeEventListener("change", onStoreChange)
    },
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
    () => false
  )
}
