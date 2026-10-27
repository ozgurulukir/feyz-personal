import fs from 'node:fs'
import path from 'node:path'
import { parseBookmarksHtml, normalizeUrl } from './parse-bookmarks.ts'

// Safely load .env if present
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch {
    // .env not present or already in environment
  }
}

interface AirtableRecordSummary {
  id: string
  fields: {
    title?: string
    url?: string
    summary?: string
    source?: string
    createdDate?: string
    tags?: string[]
    draft?: boolean
  }
}

interface CliOptions {
  file: string
  folder?: string
  tag?: string
  since?: Date
  excludeDomains: string[]
  draft: boolean
  limit?: number
  dryRun: boolean
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    file: 'bookmarks.html',
    excludeDomains: [],
    draft: false,
    dryRun: false
  }

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1]
    } else if (arg.startsWith('--folder=')) {
      options.folder = arg.split('=')[1].toLowerCase()
    } else if (arg.startsWith('--tag=')) {
      options.tag = arg.split('=')[1]
    } else if (arg.startsWith('--since=')) {
      const val = arg.split('=')[1]
      if (val.endsWith('d')) {
        const days = parseInt(val.slice(0, -1), 10)
        options.since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      } else {
        options.since = new Date(val)
      }
    } else if (arg.startsWith('--exclude=')) {
      options.excludeDomains = arg
        .split('=')[1]
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
    } else if (arg.startsWith('--draft=')) {
      options.draft = arg.split('=')[1].toLowerCase() === 'true'
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10)
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
Feyz.li Bookmark Importer
=========================
Kullanım:
  npm run import:bookmarks -- [seçenekler]

Seçenekler:
  --file=<dosya>       HTML yer imi dosyası (Varsayılan: bookmarks.html)
  --folder=<klasör>    Sadece belirtilen klasördeki yer imlerini aktar (Örn: --folder=Feyz)
  --tag=<etiketler>    Aktarılan kayıtlara eklenecek varsayılan etiketler (Örn: --tag="Teknoloji,Alıntı")
  --since=<tarih>      Belirli tarihten sonrakiler (Örn: --since=2024-01-01 veya --since=30d)
  --exclude=<alanlar>  Hariç tutulacak alan adları (Örn: --exclude=youtube.com,twitter.com)
  --draft=<true|false> Yeni kayıtlar taslak olarak mı eklensin? (Varsayılan: false)
  --limit=<sayı>       İşlenecek maksimum yer imi sayısı (Test için)
  --dry-run            Airtable'a yazmadan nelerin ekleneceğini simüle eder
  --help               Bu yardım mesajını gösterir
`)
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAllAirtableRecords(
  baseId: string,
  tableName: string,
  apiKey: string
): Promise<AirtableRecordSummary[]> {
  const records: AirtableRecordSummary[] = []
  let offset: string | undefined

  process.stdout.write('Airtable üzerindeki mevcut kayıtlar taranıyor...')

  do {
    const url = new URL(
      `/v0/${baseId}/${tableName}`,
      'https://api.airtable.com'
    )
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` }
    })

    if (!res.ok) {
      throw new Error(
        `Airtable API hatası (HTTP ${res.status}): ${await res.text()}`
      )
    }

    const data = await res.json()
    if (Array.isArray(data.records)) {
      records.push(...data.records)
    }
    offset = data.offset
    if (offset) await sleep(200)
  } while (offset)

  console.log(` Tamamlandı (${records.length} kayıt bulundu).`)
  return records
}

async function sendBatch(
  method: 'POST' | 'PATCH',
  baseId: string,
  tableName: string,
  apiKey: string,
  records: unknown[]
): Promise<void> {
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records })
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(
      `Airtable ${method} işleminde hata (HTTP ${res.status}): ${errText}`
    )
  }
}

export async function main(): Promise<void> {
  const options = parseCliArgs()

  const baseId = process.env.AIRTABLE_BASE_ID || 'appeqvrnUnbvHVDmH'
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'content'
  const apiKey = process.env.AIRTABLE_API_KEY

  if (!apiKey) {
    if (options.dryRun) {
      console.warn(
        '⚠️ Uyarı: AIRTABLE_API_KEY tanımlı değil. Airtable karşılaştırması olmadan yerel dosya analizi yapılıyor.'
      )
    } else {
      console.error(
        'Hata: AIRTABLE_API_KEY ortam değişkeni tanımlı değil. Lütfen .env dosyanızı kontrol edin.'
      )
      process.exit(1)
    }
  }

  const filePath = path.resolve(process.cwd(), options.file)
  if (!fs.existsSync(filePath)) {
    console.error(
      `Hata: Yer imi dosyası bulunamadı: ${filePath}\nLütfen geçerli bir HTML dosyası belirtin (örn: --file=bookmarks.html).`
    )
    process.exit(1)
  }

  console.log(`\n📂 Dosya okunuyor: ${options.file}`)
  const htmlContent = fs.readFileSync(filePath, 'utf-8')
  const allBookmarks = parseBookmarksHtml(htmlContent)
  console.log(`📌 Toplam bulunan yer imi: ${allBookmarks.length}`)

  // Filtreleme
  let filtered = allBookmarks.filter((item) => {
    // 1. Klasör Filtresi
    if (options.folder) {
      const inFolder = item.folderPath.some((f) =>
        f.toLowerCase().includes(options.folder!)
      )
      if (!inFolder) return false
    }

    // 2. Tarih Filtresi
    if (options.since) {
      const itemDate = new Date(item.createdDate)
      if (itemDate < options.since) return false
    }

    // 3. Alan Adı Hariç Tutma Filtresi
    if (options.excludeDomains.length > 0) {
      try {
        const host = new URL(item.url).hostname.toLowerCase()
        if (options.excludeDomains.some((d) => host.includes(d))) return false
      } catch {
        return false
      }
    }

    return true
  })

  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit)
  }

  console.log(`🎯 Filtrelerden geçen yer imi: ${filtered.length}`)
  if (filtered.length === 0) {
    console.log('İşlenecek yer imi bulunamadı.')
    return
  }

  // Mevcut Airtable kayıtlarını çek ve indeksle
  const existingRecords = apiKey
    ? await fetchAllAirtableRecords(baseId, tableName, apiKey)
    : []
  const existingMap = new Map<string, AirtableRecordSummary>()
  for (const record of existingRecords) {
    if (record.fields?.url) {
      const norm = normalizeUrl(record.fields.url)
      if (norm) existingMap.set(norm, record)
    }
  }

  const toCreate: Array<{ fields: Record<string, unknown> }> = []
  const toUpdate: Array<{ id: string; fields: Record<string, unknown> }> = []
  let unchangedCount = 0
  const seenInBatchUrls = new Set<string>()

  const IGNORED_FOLDER_TAGS = new Set([
    'bookmarks bar',
    'bookmarks toolbar',
    'bookmarks menu',
    'other bookmarks',
    'mobile bookmarks',
    'favorites',
    'yer imleri çubuğu',
    'diğer yer imleri',
    'sık kullanılanlar'
  ])

  const extraTags = options.tag
    ? options.tag
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  for (const item of filtered) {
    // Dosya içi mükerrer URL kontrolü
    if (seenInBatchUrls.has(item.normalizedUrl)) {
      continue
    }

    const existing = existingMap.get(item.normalizedUrl)

    if (existing) {
      // SADECE BOŞ ALANLARI GÜNCELLE
      const patchFields: Record<string, unknown> = {}

      if (!existing.fields.summary && item.summary) {
        patchFields.summary = item.summary
      }
      if (!existing.fields.source && item.source) {
        patchFields.source = item.source
      }
      if (
        (!existing.fields.tags || existing.fields.tags.length === 0) &&
        item.tags.length > 0
      ) {
        patchFields.tags = item.tags
      }
      if (!existing.fields.createdDate && item.createdDate) {
        patchFields.createdDate = item.createdDate
      }
      if (!existing.fields.title && item.title) {
        patchFields.title = item.title
      }

      if (Object.keys(patchFields).length > 0) {
        toUpdate.push({ id: existing.id, fields: patchFields })
      } else {
        unchangedCount++
      }
      seenInBatchUrls.add(item.normalizedUrl)
    } else {
      // YENİ KAYIT
      const folderTag =
        item.folder && !IGNORED_FOLDER_TAGS.has(item.folder.toLowerCase())
          ? item.folder
          : null

      const combinedTags = [
        ...new Set([
          ...item.tags,
          ...extraTags,
          ...(folderTag ? [folderTag] : [])
        ])
      ].filter(Boolean)

      toCreate.push({
        fields: {
          title: item.title,
          url: item.url,
          source: item.source,
          createdDate: item.createdDate,
          tags: combinedTags,
          summary: item.summary,
          draft: options.draft
        }
      })
      seenInBatchUrls.add(item.normalizedUrl)
    }
  }

  console.log('\nAnaliz Özeti:')
  console.log(`  ➕ Yeni Eklenecek: ${toCreate.length}`)
  console.log(`  🔄 Eksik Alanları Doldurulacak: ${toUpdate.length}`)
  console.log(`  ⏭️ Değişiklik Gerektirmeyen (Aynı): ${unchangedCount}`)

  if (options.dryRun) {
    if (toCreate.length > 0) {
      console.log('\nÖrnek Yeni Eklenecek Kayıtlar:')
      toCreate.slice(0, 5).forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${item.fields.title}] (${item.fields.url})`)
        if (Array.isArray(item.fields.tags) && item.fields.tags.length > 0) {
          console.log(`     Etiketler: ${item.fields.tags.join(', ')}`)
        }
      })
      if (toCreate.length > 5) {
        console.log(`  ... ve ${toCreate.length - 5} kayıt daha.`)
      }
    }

    if (toUpdate.length > 0) {
      console.log('\nÖrnek Güncellenecek Kayıtlar:')
      toUpdate.slice(0, 5).forEach((item, idx) => {
        console.log(
          `  ${idx + 1}. Kayıt ID: ${item.id} -> Alanlar: ${Object.keys(item.fields).join(', ')}`
        )
      })
    }

    console.log(
      '\n[DRY RUN]: Simülasyon tamamlandı. Veritabanına hiçbir şey yazılmadı.'
    )
    return
  }

  if (!apiKey) {
    console.error('Hata: AIRTABLE_API_KEY bulunamadı.')
    return
  }

  // 10'arlı paketler halinde Airtable'a yazma
  if (toCreate.length > 0) {
    process.stdout.write(`\n${toCreate.length} yeni kayıt ekleniyor... `)
    for (let i = 0; i < toCreate.length; i += 10) {
      const chunk = toCreate.slice(i, i + 10)
      await sendBatch('POST', baseId, tableName, apiKey, chunk)
      process.stdout.write(`[${Math.min(i + 10, toCreate.length)}] `)
      await sleep(250)
    }
    console.log('✅ Tamamlandı.')
  }

  if (toUpdate.length > 0) {
    process.stdout.write(
      `\n${toUpdate.length} mevcut kaydın boş alanları güncelleniyor... `
    )
    for (let i = 0; i < toUpdate.length; i += 10) {
      const chunk = toUpdate.slice(i, i + 10)
      await sendBatch('PATCH', baseId, tableName, apiKey, chunk)
      process.stdout.write(`[${Math.min(i + 10, toUpdate.length)}] `)
      await sleep(250)
    }
    console.log('✅ Tamamlandı.')
  }

  console.log('\n🎉 Yer imleri başarıyla içe aktarıldı!\n')
}

// Doğrudan çağrıldığında çalıştır
if (process.argv[1] && process.argv[1].includes('import-bookmarks')) {
  main().catch((err) => {
    console.error('\nİşlem sırasında bir hata oluştu:', err)
    process.exit(1)
  })
}
