export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RJ</span>
          </div>
          <span className="text-xl font-bold text-gray-900">RJ4WEAR</span>
        </div>
        
        <div className="flex space-x-2 justify-center">
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  )
}