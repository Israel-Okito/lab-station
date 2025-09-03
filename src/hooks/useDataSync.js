'use client'

import { useEffect, useRef, useCallback } from 'react'

// Hook pour synchroniser les données entre composants
export function useDataSync(callback, dependencies = []) {
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (callbackRef.current) {
        callbackRef.current()
      }
    }, 30000) // Rafraîchir toutes les 30 secondes
    
    return () => clearInterval(interval)
  }, dependencies)
  
  return callbackRef.current
}

// Hook pour déclencher une mise à jour manuelle
export function useManualRefresh() {
  const refreshCallbacks = useRef(new Set())
  
  const addRefreshCallback = (callback) => {
    refreshCallbacks.current.add(callback)
    return () => refreshCallbacks.current.delete(callback)
  }
  
  const triggerRefresh = () => {
    refreshCallbacks.current.forEach(callback => callback())
  }
  
  return { addRefreshCallback, triggerRefresh }
}

// Hook pour la synchronisation immédiate + automatique
export function useSmartDataSync(callback, dependencies = []) {
  const callbackRef = useRef(callback)
  const lastUpdateRef = useRef(Date.now())
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  // Fonction pour forcer une mise à jour immédiate
  const forceUpdate = useCallback(() => {
    if (callbackRef.current) {
      callbackRef.current()
      lastUpdateRef.current = Date.now()
    }
  }, [])
  
  // Synchronisation automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (callbackRef.current) {
        callbackRef.current()
        lastUpdateRef.current = Date.now()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, dependencies)
  
  return { forceUpdate, lastUpdate: lastUpdateRef.current }
}

// Hook pour la synchronisation globale entre composants
export function useGlobalDataSync() {
  const syncCallbacks = useRef(new Map())
  
  const registerSync = useCallback((key, callback) => {
    syncCallbacks.current.set(key, callback)
    return () => syncCallbacks.current.delete(key)
  }, [])
  
  const triggerGlobalSync = useCallback((key) => {
    const callback = syncCallbacks.current.get(key)
    if (callback) {
      callback()
    }
  }, [])
  
  const triggerAllSync = useCallback(() => {
    syncCallbacks.current.forEach(callback => callback())
  }, [])
  
  return { registerSync, triggerGlobalSync, triggerAllSync }
}
