import { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, Mail, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Authentication Error | RJ4WEAR',
  description: 'There was an issue with your authentication',
}

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              There was an issue verifying your email or magic link
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Possible Issues:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The verification link has expired</li>
                      <li>The link has already been used</li>
                      <li>The link is invalid or corrupted</li>
                      <li>There was a temporary server issue</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">What you can do:</h3>
              
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Try Logging In
                </Link>

                <Link
                  href="/auth/signup"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request New Verification Email
                </Link>

                <Link
                  href="/"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Need Help?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      If you continue to have issues, please contact our support team at{' '}
                      <a href="mailto:support@rj4wear.com" className="underline">
                        support@rj4wear.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
