// exportExcel.js
// Handles generating the .xlsx output file using SheetJS

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function toWorksheet(rows, extraColumns = []) {
  if (!rows || rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([['No data found for this category.']]);
  }
  const allKeys = [...new Set([...Object.keys(rows[0]), ...extraColumns])];
  const data = [
    allKeys,
    ...rows.map(row => allKeys.map(key => row[key] || ''))
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = allKeys.map(key => ({ wch: Math.max(key.length, 15) }));
  return ws;
}

function toSummarySheet(moduleName, results, timestamp) {
  const data = [
    ['Audit Summary'],
    [''],
    ['Module', moduleName],
    ['Run Date', timestamp],
    [''],
    ['Category', 'Count'],
    ['Terminated', results.terminated.length],
    ['Unaccounted', results.unaccounted.length],
    ['Blacklisted (Suppressed)', results.blacklisted.length],
    ['Clean', results.clean.length],
    [''],
    ['Total Processed',
      results.terminated.length +
      results.unaccounted.length +
      results.blacklisted.length +
      results.clean.length
    ]
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
  return ws;
}

export function exportToExcel(moduleName, results) {
  const timestamp = new Date().toLocaleString();
  const dateStamp = new Date().toISOString().split('T')[0];
  const fileName = `${moduleName}_Audit_${dateStamp}.xlsx`;

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, toSummarySheet(moduleName, results, timestamp), 'Summary');
  XLSX.utils.book_append_sheet(wb, toWorksheet(results.terminated, ['Audit Reason']), 'Terminated');
  XLSX.utils.book_append_sheet(wb, toWorksheet(results.unaccounted, ['Audit Reason']), 'Unaccounted');
  XLSX.utils.book_append_sheet(wb, toWorksheet(results.blacklisted, ['Audit Reason']), 'Suppressed');
  XLSX.utils.book_append_sheet(wb, toWorksheet(results.clean), 'Clean');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, fileName);
}