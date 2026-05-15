// Cloudflare Function to generate the HTML report for race results


// Constants (should be kept in sync with calculator.js)
const CATEGORIE = ['A', 'B', 'C', 'D', 'E'];

export async function onRequestPost(context) {
    const { request } = context;

    try {
        const { race_id, single_race_results, cumulative_data } = await request.json();

        if (!race_id || !single_race_results || !cumulative_data) {
            return new Response(JSON.stringify({ error: 'Missing data for report generation' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // --- Helper Functions (copied and adapted from central_calculator.py and index.html) ---

        function _formatTime(sec) {
            if (!sec || isNaN(sec) || sec < 0) return '00:00:00';
            const h = Math.floor(sec / 3600);
            const m = Math.floor((sec % 3600) / 60);
            const s = Math.floor(sec % 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        function _createFlagHtml(rider) {
            const flag = rider.flag;
            if (flag) {
                return `<img src="https://flagcdn.com/w20/${flag.toLowerCase()}.png" alt="${flag}" style="width: 20px; height: 15px; vertical-align: middle; margin-right: 8px; border: 1px solid #555;">`;
            }
            return '';
        }

        function _generateTableHtml(title, data, colsConfig) {
            if (!data || data.length === 0) return '';
            
            let tableHtml = `<h2 style="margin-top: 30px; font-size: 1.4em; color: #333;">${title}</h2>`;
            tableHtml += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><thead><tr style="background-color: #f2f2f2;">';
            colsConfig.forEach(col => {
                tableHtml += `<th style="padding: 10px; border: 1px solid #ddd; text-align: center; ${col.style || ''}">${col.header}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';

            data.forEach((r, i) => {
                const bgColor = (i === 0) ? '#ffeb3b' : (i === 1) ? '#c0c0c0' : (i === 2) ? '#cd7f32' : (i % 2 === 0 ? '#f9f9f9' : '#ffffff');
                const posColor = (i < 3) ? '#333' : '#666';
                
                tableHtml += `<tr style="background-color: ${bgColor};">`;
                tableHtml += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${posColor};">${i + 1}</td>`;
                
                colsConfig.forEach(col => {
                    if (col.key === 'position') return; // Position is handled by the first td
                    let displayValue = r[col.key];
                    if (col.key === 'time' || col.key === 'tempo_time' || col.key === 'total_time') {
                        displayValue = (displayValue === 0 || displayValue === undefined) ? '<span style="color: #666; font-style: italic;">DNF</span>' : _formatTime(displayValue);
                    } else if (col.key === 'name') {
                        displayValue = _createFlagHtml(r) + (displayValue || '');
                    }
                     else if (col.key && col.key.includes('pts_') && displayValue === undefined) {
                        displayValue = 0; // Ensure points are shown as 0 if undefined
                    }

                    tableHtml += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; ${col.style || ''}">${displayValue !== undefined ? displayValue : ''}</td>`;
                });
                tableHtml += '</tr>';
            });
            
            tableHtml += '</tbody></table>';
            return tableHtml;
        }

        // --- Column Configurations for Report Tables ---
        const singlePuntiCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'FAL', key: 'fal' }, { header: 'FTS', key: 'fts' }, { header: 'FIN', key: 'fin' },
            { header: 'Totale', key: 'total', style: 'font-weight: bold; color: #4CAF50;' }, { header: 'Tempo', key: 'time' }
        ];
        const singleTempoCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Tempo', key: 'time', style: 'font-weight: bold; color: #007bff;' }, { header: 'Totale Punti', key: 'total' }
        ];
        const singleSprinterCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti Sprint', key: 'pts_sprint', style: 'font-weight: bold; color: #4CAF50;' }, { header: 'Totale Punti', key: 'total', style: 'color: #999;' }
        ];
        const singleClimberCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti KOM', key: 'pts_kom', style: 'font-weight: bold; color: #4CAF50;' }, { header: 'Totale Punti', key: 'total', style: 'color: #999;' }
        ];
        const cumPuntiCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'FAL', key: 'fal' }, { header: 'FTS', key: 'fts' }, { header: 'FIN', key: 'fin' },
            { header: 'Totale', key: 'total', style: 'font-weight: bold; color: #4CAF50;' }, { header: 'Tempo Tot.', key: 'time' }
        ];
        const cumTempoCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Tempo Totale', key: 'time', style: 'font-weight: bold; color: #007bff;' }, { header: 'Totale Punti', key: 'total' }
        ];
        const cumSprinterCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti Sprint', key: 'pts_sprint', style: 'font-weight: bold; color: #4CAF50;' }, { header: 'Punti Gara Tot.', key: 'total', style: 'color: #999;' }
        ];
        const cumClimberCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti KOM', key: 'pts_kom', style: 'font-weight: bold; color: #4CAF50;' }, { header: 'Punti Gara Tot.', key: 'total', style: 'color: #999;' }
        ];


        let reportHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 900px; margin: 0 auto;">
                <h1 style="color: #008CBA; border-bottom: 2px solid #008CBA; padding-bottom: 10px; text-align: center;">🏁 Risultati Gara ${race_id} & Classifiche Generali</h1>
        `;

        CATEGORIE.forEach(cat => {
            if (!single_race_results[cat] || single_race_results[cat].punti.length === 0) {
                return; // Skip empty categories
            }
            
            // Re-sort cumulative data for reporting as it might not be sorted after being retrieved from DB
            const cumResultsCat = cumulative_data.results[cat] || [];
            const cumPunti = [...cumResultsCat].sort((a, b) => (b.total || 0) - (a.total || 0) || (a.time || 0) - (b.time || 0));
            const cumTempo = [...cumResultsCat].filter(r => (r.time || 0) > 0).sort((a, b) => (a.time || Infinity) - (b.time || Infinity) || (b.total || 0) - (a.total || 0));
            const cumSprinter = [...cumResultsCat].filter(r => (r.pts_sprint || 0) > 0).sort((a, b) => (b.pts_sprint || 0) - (a.pts_sprint || 0) || (b.fts || 0) - (a.fts || 0));
            const cumClimber = [...cumResultsCat].filter(r => (r.pts_kom || 0) > 0).sort((a, b) => (b.pts_kom || 0) - (a.pts_kom || 0) || (b.fts || 0) - (a.fts || 0));


            reportHtml += `<h1 style="color: #6a1b9a; border-bottom: 1px dashed #6a1b9a; margin-top: 40px; text-align: left;">➡️ Categoria ${cat}</h1>`;

            // Single Race Tables
            reportHtml += _generateTableHtml(`Risultati Gara ${race_id} - Classifica Punti 🥇`, single_race_results[cat].punti, singlePuntiCols);
            reportHtml += _generateTableHtml(`Risultati Gara ${race_id} - Classifica Tempo ⏱️`, single_race_results[cat].tempo, singleTempoCols);
            reportHtml += _generateTableHtml(`Risultati Gara ${race_id} - Specialista Sprinter ⚡`, single_race_results[cat].sprinter, singleSprinterCols);
            reportHtml += _generateTableHtml(`Risultati Gara ${race_id} - Specialista Scalatore ⛰️`, single_race_results[cat].climber, singleClimberCols);

            // Cumulative Tables
            reportHtml += _generateTableHtml(`Classifica Generale Punti dopo Gara ${race_id} 🏆`, cumPunti, cumPuntiCols);
            reportHtml += _generateTableHtml('Classifica Generale Specialista Sprinter ⚡', cumSprinter, cumSprinterCols);
            reportHtml += _generateTableHtml('Classifica Generale Specialista Scalatore ⛰️', cumClimber, cumClimberCols);
            reportHtml += _generateTableHtml('Classifica Generale Tempo Totale ⏱️', cumTempo, cumTempoCols);
        });

        reportHtml += `<p style="text-align: right; font-size: 0.8em; margin-top: 40px; color: #888;">Report generato automaticamente dal Calcolatore Masters Winter Tour.</p></div>`;
        
        return new Response(reportHtml, {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        console.error(`Error generating HTML report for race ${race_id}:`, error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
