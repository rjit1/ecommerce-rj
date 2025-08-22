'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { Database } from '@/lib/supabase'
import { CartProvider } from '@/contexts/CartContext'
import { CartDataProvider } from '@/contexts/CartDataContext'
import CartSidebarWrapper from '@/components/cart/CartSidebarWrapper'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import SessionRefresh from '@/components/auth/SessionRefresh'

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => {
    const client = createClientComponentClient<Database>()
    
    // Handle auth state changes and refresh token errors
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      }
    })

    return client
  })

  return (
    <ErrorBoundary>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <SessionRefresh />
        <CartDataProvider>
          <CartProvider>
            {children}
            <CartSidebarWrapper />
          </CartProvider>
        </CartDataProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  )
}