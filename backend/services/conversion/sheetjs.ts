/**
 * services/conversion/sheetjs.ts
 *
 * Excel ↔ CSV conversions using SheetJS (xlsx).
 * These conversions are lightweight and run in-process — no Gotenberg needed.
 *
 * Install: npm install xlsx
 */

import * as XLSX from 'xlsx';
import { logger } from '@/backend/utils/logger';

/**
 * Converts between Excel (.xlsx/.xls) and CSV using SheetJS.
 */
export async function convertExcelCsv(
  inputBuffer: Buffer,
  sourceType: string,
  targetType: string
): Promise<Buffer> {
  logger.info(`[SheetJS] Converting ${sourceType} → ${targetType}`);

  if (sourceType === 'xlsx' && targetType === 'csv') {
    return excelToCsv(inputBuffer);
  }
  if (sourceType === 'csv' && targetType === 'xlsx') {
    return csvToExcel(inputBuffer);
  }
  throw new Error(`SheetJS: unsupported conversion ${sourceType} → ${targetType}`);
}

function excelToCsv(buffer: Buffer): Buffer {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  // Export the first (active) sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ',', RS: '\r\n', strip: true });
  return Buffer.from(csv, 'utf-8');
}

function csvToExcel(buffer: Buffer): Buffer {
  const csv = buffer.toString('utf-8');
  const worksheet = XLSX.utils.aoa_to_sheet(
    XLSX.utils.sheet_to_json(XLSX.read(csv, { type: 'string' }).Sheets['Sheet1'], { header: 1 }) as any[][]
  );
  // Apply basic table formatting
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(xlsxBuffer);
}
