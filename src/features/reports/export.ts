export type CsvColumn<T> = {
  header: string
  value: (row: T) => string | number | null | undefined
}

function escapeCsv(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ""
  const str = String(value)
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const header = columns.map((c) => escapeCsv(c.header)).join(",")
  const body = rows.map((row) =>
    columns.map((c) => escapeCsv(c.value(row))).join(",")
  )
  return [header, ...body].join("\r\n")
}

/** Builds a CSV in the browser and triggers a download. */
export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
) {
  // BOM so Excel opens UTF-8 correctly
  const blob = new Blob(["﻿", toCsv(rows, columns)], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
