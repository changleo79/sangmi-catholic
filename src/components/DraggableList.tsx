import { useState } from 'react'

interface DraggableListProps<T> {
  items: T[]
  onReorder: (reorderedItems: T[]) => void
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode
  keyExtractor: (item: T, index: number) => string | number
}

export default function DraggableList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor
}: DraggableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)
    
    onReorder(newItems)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={keyExtractor(item, index)}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-all ${
            draggedIndex === index
              ? 'opacity-50 cursor-grabbing'
              : dragOverIndex === index
              ? 'border-catholic-logo border-2 border-dashed'
              : 'cursor-grab'
          }`}
        >
          {renderItem(item, index, draggedIndex === index)}
        </div>
      ))}
    </div>
  )
}

