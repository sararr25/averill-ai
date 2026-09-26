const ExcelJS = require('exceljs');
(async () => {
 const workbook = new ExcelJS.Workbook();
 await workbook.xlsx.readFile(process.argv[2]);
 const lines = [];
 let count = 0;
 for (const sheet of workbook.worksheets.slice(0, 20)) {
  lines.push(`# Sheet: ${sheet.name}`);
  sheet.eachRow((row, index) => {
   if (count >= 2000 || index > 2000) return;
   const cells = [];
   for (let column = 1; column <= Math.min(sheet.columnCount, 50); column++) {
    const cell = row.getCell(column);
    // Use displayed values/cached formula results; never evaluate formulas or fetch links.
    cells.push(String(cell.text || '').replace(/[\t\r\n]+/g, ' ').slice(0, 1000));
   }
   lines.push(cells.join('\t')); count++;
  });
 }
 if (count >= 2000) lines.push('[Extraction limited to 2000 rows]');
 process.stdout.write(lines.join('\n').slice(0, 100000));
})().catch(() => { process.stderr.write('Could not read this Excel workbook. Export it as XLSX or CSV and retry.'); process.exit(1); });
