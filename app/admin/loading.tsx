export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500 border-opacity-50"></div>
      <p className="mt-4 text-gray-600 text-sm">Loading admin dashboard...</p>
    </div>
  )
}
