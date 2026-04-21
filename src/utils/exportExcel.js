// exportExcel.js
// Handles generating the .xlsx output file using SheetJS

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Converts an array of objects to a worksheet.
 */
function toWorksheet(rows, extraColumns = []) {
  if (!rows || rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([['No data found for this category.']]);
  }

  const allKeys = [...new Set([
    ...Object.keys(rows[0]).filter(k => !k.startsWith('_')),
    ...extraColumns
  ])];

  const data = [
    allKeys,
    ...rows.map(row => allKeys.map(key => row[key] || ''))
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = allKeys.map(key => ({ wch: Math.max(key.length, 15) }));
  return ws;
}

/**
 * Creates a summary worksheet from the audit results.
 */
function toSummarySheet(assetName, results, timestamp) {
  const total =
    results.terminated.length +
    results.unaccounted.length +
    results.flagged.length +
    results.blacklisted.length +
    results.clean.length;

  const data = [
    ['Audit Summary'],
    [''],
    ['Asset Type', assetName],
    ['Run Date', timestamp],
    [''],
    ['Category', 'Count', 'Percentage'],
    ['Terminated', results.terminated.length,
      total > 0 ? ((results.terminated.length / total) * 100).toFixed(1) + '%' : '0%'],
    ['Unaccounted', results.unaccounted.length,
      total > 0 ? ((results.unaccounted.length / total) * 100).toFixed(1) + '%' : '0%'],
    ['Flagged', results.flagged.length,
      total > 0 ? ((results.flagged.length / total) * 100).toFixed(1) + '%' : '0%'],
    ['Suppressed (Blacklisted)', results.blacklisted.length,
      total > 0 ? ((results.blacklisted.length / total) * 100).toFixed(1) + '%' : '0%'],
    ['Clean', results.clean.length,
      total > 0 ? ((results.clean.length / total) * 100).toFixed(1) + '%' : '0%'],
    [''],
    ['Total Processed', total, '100%']
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
  return ws;
}

/**
 * MAIN EXPORT FUNCTION
 * Generates and downloads the .xlsx file.
 */
export function exportToExcel(assetName, results) {
  const timestamp = new Date().toLocaleString();
  const dateStamp = new Date().toISOString().split('T')[0];
  const fileName = `${assetName}_Audit_${dateStamp}.xlsx`;

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb, toSummarySheet(assetName, results, timestamp), 'Summary'
  );
  XLSX.utils.book_append_sheet(
    wb, toWorksheet(results.terminated, ['Audit Reason']), 'Terminated'
  );
  XLSX.utils.book_append_sheet(
    wb, toWorksheet(results.unaccounted, ['Audit Reason']), 'Unaccounted'
  );
  XLSX.utils.book_append_sheet(
    wb, toWorksheet(results.flagged, ['Audit Reason']), 'Flagged'
  );
  XLSX.utils.book_append_sheet(
    wb, toWorksheet(results.blacklisted, ['Audit Reason']), 'Suppressed'
  );
  XLSX.utils.book_append_sheet(
    wb, toWorksheet(results.clean), 'Clean'
  );

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, fileName);
}