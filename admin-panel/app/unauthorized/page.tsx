import Link from 'next/link'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-danger-500 rounded-xl">
            <ExclamationTriangleIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access the admin panel.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/login"
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}