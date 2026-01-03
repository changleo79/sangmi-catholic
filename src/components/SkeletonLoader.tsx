interface SkeletonLoaderProps {
  type?: 'image' | 'text' | 'card' | 'list'
  width?: string
  height?: string
  className?: string
}

export default function SkeletonLoader({
  type = 'text',
  width,
  height,
  className = ''
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'

  if (type === 'image') {
    return (
      <div
        className={`${baseClasses} ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          backgroundColor: '#e5e7eb'
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={`${baseClasses} p-4 ${className}`} style={{ width: width || '100%', height: height }}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${baseClasses} h-12`}></div>
        ))}
      </div>
    )
  }

  // text (default)
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    ></div>
  )
}

