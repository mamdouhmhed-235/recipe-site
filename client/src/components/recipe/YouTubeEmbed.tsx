import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getYouTubeVideoId } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string
  className?: string
}

export function YouTubeEmbed({ url, className }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoId = getYouTubeVideoId(url)

  if (!videoId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Invalid YouTube URL</p>
        <Button variant="outline" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Original Video
          </a>
        </Button>
      </div>
    )
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}`

  return (
    <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
      {!isLoaded ? (
        <div 
          className="relative w-full h-full bg-muted cursor-pointer group"
          onClick={() => setIsLoaded(true)}
        >
          <img
            src={thumbnailUrl}
            alt="YouTube video thumbnail"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all group-hover:bg-black/60">
            <div className="bg-red-600 rounded-full p-4 transition-transform group-hover:scale-110">
              <Play className="h-8 w-8 text-white fill-current" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-medium">Video Tutorial</p>
            <p className="text-sm opacity-90">Click to play</p>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}
    </div>
  )
}