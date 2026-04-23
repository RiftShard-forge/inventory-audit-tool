// exportExcel.js
// Dynamic xlsx export — tabs generated from audit categories

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Converts an array of objects to a worksheet.
 * Filters out internal _ prefixed columns from display.
 */
function toWorksheet(rows, includeAuditColumns = true) {
  if (!rows || rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([['No data found for this category.']]);
  }

  const allKeys = Object.keys(rows[0]).filter(k => {
    if (k.startsWith('_') && !includeAuditColumns) return false;
    return true;
  });

  const displayKeys = allKeys.filter(k => !k.startsWith('_'));
  const auditKeys = allKeys.filter(k => k.startsWith('_'));
  const orderedKeys = [...displayKeys, ...auditKeys.map(k => k.replace('_', ''))];
  const sourceKeys = [...displayKeys, ...auditKeys];

  const data = [
    orderedKeys,
    ...rows.map(row => sourceKeys.map(key => row[key] || ''))
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = orderedKeys.map(key => ({ wch: Math.max(key.length, 15) }));
  return ws;
}

/**
 * Creates a summary worksheet.
 */
function toSummarySheet(assetName, summary, timestamp) {
  const data = [
    ['Audit Summary'],
    [''],
    ['Asset Type', assetName],
    ['Run Date', timestamp],
    [''],
    ['Category', 'Count'],
    ...Object.entries(summary.byCategory).map(([cat, count]) => [cat, count]),
    [''],
    ['Suppressed (Blacklisted)', summary.totalBlacklisted],
    ['Clean', summary.totalClean],
    [''],
    ['Total Processed', summary.totalProcessed],
    ['Total Flagged', summary.totalFlagged]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];
  return ws;
}

/**
 * MAIN EXPORT FUNCTION
 * Generates .xlsx with dynamic tabs based on audit categories.
 */
export function exportToExcel(assetName, results) {
  const timestamp = new Date().toLocaleString();
  const dateStamp = new Date().toISOString().split('T')[0];
  const fileName = `${assetName}_Audit_${dateStamp}.xlsx`;

  const wb = XLSX.utils.book_new();

  // Tab 1: Summary
  XLSX.utils.book_append_sheet(
    wb,
    toSummarySheet(assetName, results.summary, timestamp),
    'Summary'
  );

  // Dynamic category tabs
  Object.entries(results.byCategory).forEach(([category, rows]) => {
    const safeName = category.substring(0, 31).replace(/[:\\/?*\[\]]/g, '-');
    XLSX.utils.book_append_sheet(wb, toWorksheet(rows), safeName);
  });

  // Suppressed tab
  if (results.blacklisted && results.blacklisted.length > 0) {
    XLSX.utils.book_append_sheet(
      wb,
      toWorksheet(results.blacklisted),
      'Suppressed'
    );
  }

  // Clean tab
  XLSX.utils.book_append_sheet(
    wb,
    toWorksheet(results.clean, false),
    'Clean'
  );

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, fileName);
}