export type AlbumPhoto = {
  src: string // path under /albums
  alt?: string
  tags?: string[]
}

export type Album = {
  title: string
  date: string // YYYY-MM-DD
  cover: string // path to cover image under /albums
  photos: AlbumPhoto[]
}

// Sample album using Unsplash external links for now; replace with /albums/... when you add real photos
export const albums: Album[] = [
  {
    title: '상미성당 풍경',
    date: '2025-11-01',
    cover: 'https://images.unsplash.com/photo-1495366400704-9d9999da27e3?q=80&w=1200&auto=format&fit=crop',
    photos: [
      { src: 'https://images.unsplash.com/photo-1495366400704-9d9999da27e3?q=80&w=1200&auto=format&fit=crop', alt: '성당 외관', tags: ['외관', '주간'] },
      { src: 'https://images.unsplash.com/photo-1513438205128-16af1684e02f?q=80&w=1200&auto=format&fit=crop', alt: '성당 내부', tags: ['내부', '전례'] },
      { src: 'https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=1200&auto=format&fit=crop', alt: '스테인드글라스', tags: ['스테인드글라스'] },
      { src: 'https://images.unsplash.com/photo-1549643036-55f0823f9f96?q=80&w=1200&auto=format&fit=crop', alt: '제대', tags: ['제대'] }
    ]
  }
]



