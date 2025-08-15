'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { Database } from '@/lib/supabase'
import { CartProvider } from '@/contexts/CartContext'
import CartSidebarWrapper from '@/components/cart/CartSidebarWrapper'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>())

  return (
    <ErrorBoundary>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <CartProvider>
          {children}
          <CartSidebarWrapper />
        </CartProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  )
}