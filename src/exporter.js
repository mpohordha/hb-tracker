import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { exportAll } from './storage'

function formatStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

export async function exportData() {
  const data = await exportAll()
  const json = JSON.stringify(data, null, 2)
  const filename = `hb-tracker-backup_${formatStamp()}.json`

  if (Capacitor.isNativePlatform()) {
    // Write to a directory we can share from
    const result = await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    // Open the share sheet
    await Share.share({
      title: 'HB Tracker backup',
      text: 'My HB Tracker readings — please save this file to keep a copy.',
      url: result.uri,
      dialogTitle: 'Save or share your backup',
    })
    return { ok: true, filename }
  } else {
    // Web fallback
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return { ok: true, filename }
  }
}

// Also export as CSV for the readings (handy to send to a midwife)
export async function exportReadingsCSV() {
  const data = await exportAll()
  const rows = [['Date', 'HB (g/dL)', 'Pregnancy week', 'Status']]
  for (const r of data.readings) {
    let status = 'Healthy'
    if (r.hb < 11) status = 'Mild anaemia'
    if (r.hb < 10) status = 'Moderate anaemia'
    if (r.hb < 7) status = 'Severe anaemia'
    rows.push([r.date, r.hb.toFixed(1), r.week ?? '', status])
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const filename = `hb-readings_${formatStamp()}.csv`

  if (Capacitor.isNativePlatform()) {
    const result = await Filesystem.writeFile({
      path: filename,
      data: csv,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    await Share.share({
      title: 'My HB readings',
      text: `${data.profile?.name || 'HB Tracker user'} — HB readings export.`,
      url: result.uri,
      dialogTitle: 'Share readings with midwife',
    })
    return { ok: true, filename }
  } else {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return { ok: true, filename }
  }
}
