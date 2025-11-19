export default function Notice() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">공지사항</h1>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="divide-y">
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">공지사항이 없습니다</h3>
                <p className="text-gray-600 text-sm">
                  새로운 공지사항이 등록되면 여기에 표시됩니다.
                </p>
              </div>
              <span className="text-gray-400 text-sm">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





