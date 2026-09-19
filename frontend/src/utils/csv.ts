interface CsvColumn {
  key: string;
  label: string;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  let str: string;
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function toCsv(rows: any[], columns: CsvColumn[]): string {
  const headerRow = columns.map((col) => escapeCsvValue(col.label)).join(',');
  const dataRows = rows.map((row) =>
    columns.map((col) => escapeCsvValue(row[col.key])).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

export function triggerCsvDownload(
  filename: string,
  rows: any[],
  columns: CsvColumn[]
): void {
  const csvContent = toCsv(rows, columns);
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
