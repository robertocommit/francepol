// src/lib/import-csv.ts
import fs from 'fs';
import path from 'path';

export async function importCsvData(db: any) {
    try {
        const csvPath = path.resolve('/shared/volumes/a24e25/full_dataset.csv');
        
        if (!fs.existsSync(csvPath)) {
            console.log('CSV file not found, skipping import');
            return;
        }

        console.log('Reading CSV file...');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length <= 1) {
            console.log('No data rows found in CSV');
            return;
        }

        // Skip header row
        const dataLines = lines.slice(1);
        let importedCount = 0;

        console.log(`Processing ${dataLines.length} data rows...`);

        for (const line of dataLines) {
            if (!line.trim()) continue;

            const columns = line.split(',');
            if (columns.length < 8) continue;

            const [
                driver,
                month,
                frachtyStr,
                paliwoStr,
                razemStr,
                wynagrStr,
                wynikMcStr,
                wynikNarastStr
            ] = columns;

            // Parse Polish number format (comma as decimal separator)
            const parsePolishNumber = (str: string): number => {
                if (!str || str.trim() === '') return 0;
                return parseFloat(str.replace(',', '.')) || 0;
            };

            const frachty = parsePolishNumber(frachtyStr);
            const paliwo = parsePolishNumber(paliwoStr);
            const razem = parsePolishNumber(razemStr);
            const wynagr = parsePolishNumber(wynagrStr);
            const wynikMc = parsePolishNumber(wynikMcStr);
            const wynikNarast = parsePolishNumber(wynikNarastStr);

            // Insert into database
            try {
                db.prepare(`
                    INSERT OR REPLACE INTO entries 
                    (driver, month, frachty, paliwo, razem, wynagr, wynik_mc, wynik_narast)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(driver, month, frachty, paliwo, razem, wynagr, wynikMc, wynikNarast);
                
                importedCount++;
            } catch (insertError) {
                console.error(`Error inserting row for ${driver} ${month}:`, insertError);
            }
        }

        console.log(`Successfully imported ${importedCount} entries from CSV`);
    } catch (error) {
        console.error('Error importing CSV data:', error);
        throw error;
    }
}
