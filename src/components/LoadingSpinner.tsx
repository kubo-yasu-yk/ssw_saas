export default function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
      <span>読み込み中...</span>
    </div>
  )
}

