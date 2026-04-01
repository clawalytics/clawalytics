import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

type WsEventType =
  | 'costs:updated'
  | 'session:new'
  | 'alert:new'
  | 'device:changed'
  | 'desktop:close-requested'

interface WsMessage {
  type: WsEventType | 'connected'
  data?: unknown
  timestamp: string
}

const RECONNECT_DELAY = 3000
const MAX_RECONNECT_DELAY = 30000
export const DESKTOP_CLOSE_REQUESTED_EVENT = 'clawalytics:desktop-close-requested'

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectDelayRef = useRef(RECONNECT_DELAY)

  useEffect(() => {
    let mounted = true
    let reconnectTimeout: ReturnType<typeof setTimeout>

    function connect() {
      if (!mounted) return

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        reconnectDelayRef.current = RECONNECT_DELAY
      }

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data)
          handleMessage(message, queryClient)
        } catch {
          // Ignore parse errors
        }
      }

      ws.onclose = () => {
        wsRef.current = null
        if (mounted) {
          reconnectTimeout = setTimeout(() => {
            reconnectDelayRef.current = Math.min(
              reconnectDelayRef.current * 1.5,
              MAX_RECONNECT_DELAY
            )
            connect()
          }, reconnectDelayRef.current)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      mounted = false
      clearTimeout(reconnectTimeout)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [queryClient])
}

function handleMessage(
  message: WsMessage,
  queryClient: ReturnType<typeof useQueryClient>
) {
  switch (message.type) {
    case 'costs:updated':
      queryClient.invalidateQueries({ queryKey: ['enhancedStats'] })
      queryClient.invalidateQueries({ queryKey: ['dailyCosts'] })
      queryClient.invalidateQueries({ queryKey: ['modelUsage'] })
      queryClient.invalidateQueries({ queryKey: ['tokenBreakdown'] })
      queryClient.invalidateQueries({ queryKey: ['budgetStatus'] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] })
      queryClient.invalidateQueries({ queryKey: ['projectBreakdown'] })
      break

    case 'session:new':
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['enhancedStats'] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] })
      queryClient.invalidateQueries({ queryKey: ['projectBreakdown'] })
      queryClient.invalidateQueries({ queryKey: ['sessionFilters'] })
      break

    case 'alert:new':
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['securityDashboard'] })
      break

    case 'device:changed':
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['securityDashboard'] })
      break

    case 'desktop:close-requested':
      window.dispatchEvent(new CustomEvent(DESKTOP_CLOSE_REQUESTED_EVENT))
      break
  }
}
