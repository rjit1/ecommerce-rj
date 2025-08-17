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
  const [supabaseClient] = useState(() => createClientComponentClient<Database>())

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