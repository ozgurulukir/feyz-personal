export interface AirtableAttachment {
  id: string
  width: number
  height: number
  url: string
  filename?: string
  size?: number
  type?: string
  thumbnails?: {
    small?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
    full?: { url: string; width: number; height: number }
  }
}

export interface AirtableRecord {
  id: string
  createdTime: string
  fields: {
    title?: string
    url?: string
    createdDate?: string
    tags?: string[]
    summary?: string
    source?: string
    draft?: boolean
    author?: string
    image?: AirtableAttachment[]
  }
}
