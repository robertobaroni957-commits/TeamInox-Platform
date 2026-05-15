// Frontend logic for Masters Winter Tour standings calculator
// This script interacts with the Cloudflare Worker backend.

const CATEGORIE = ['A','B','C','D','E']; // Keep constants in sync with backend

// --- DOM Elements ---
const selectGara = document.getElementById('selectGara');
const loadGaraBtn = document.getElementById('loadGaraBtn');
const calcolaClassificheBtn = document.getElementById('calcolaClassificheBtn');
const downloadCumulativeBtn = document.getElementById('downloadCumulativeBtn');
const downloadSingleBtn = document.getElementById('downloadSingleBtn');
const downloadHtmlReportBtn = document.getElementById('downloadHtmlReportBtn');
const statusMessageDiv = document.getElementById('statusMessage');
const segmentPanel = document.getElementById('segmentPanel');
const garaSegmentoIdSpan = document.getElementById('garaSegmentoId');
const segmentTableBody = document.querySelector('#segmentTable tbody');
const classificheDiv = document.getElementById('classifiche');
const logoutBtn = document.getElementById('logoutBtn'); // New logout button

// --- Global State ---
let allRaces = []; // List of race IDs from backend
let currentRaceData = null; // Raw FAL/FTS/FIN data for the selected race
let selectedSegments = {}; // { "Segment Name (Lap X)": "SPRINT" | "KOM" | "NONE" }
let lastCalculatedResults = null; // Stores the results from the last successful calculation
let lastCalculatedCumulative = null; // Stores the cumulative results from the last successful calculation

// --- Utility Functions ---
function showStatus(message, isError = false) {
    statusMessageDiv.textContent = message;
    statusMessageDiv.style.display = 'block';
    statusMessageDiv.style.backgroundColor = isError ? '#d32f2f' : '#007bff';
}

function hideStatus() {
    statusMessageDiv.style.display = 'none';
}

function formatTime(sec) {
    if (!sec || isNaN(sec) || sec < 0) return '00:00:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function createFlagHtml(rider) {
    if (rider && rider.flag) {
        return `<img src="https://flagcdn.com/w20/${rider.flag.toLowerCase()}.png" alt="${rider.flag}" style="width: 20px; height: 15px; vertical-align: middle; margin-right: 8px; border: 1px solid #555;">`;
    }
    return '';
}

function downloadJsonFile(data, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function downloadHtmlFile(htmlContent, filename) {
    const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// --- Logout Function ---
function logout() {
    document.cookie = 'mwt_jwt=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict'; // Clear the cookie
    window.location.href = '/login.html'; // Redirect to login page
}

// --- API Interaction ---

async function fetchRaces() {
    showStatus('Caricamento lista gare...', false);
    try {
        const response = await fetch('/api/races');
        if (response.status === 401) { // Unauthorized, likely not logged in
            window.location.href = '/login.html';
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const races = await response.json();
        allRaces = races;
        populateSelectGara(races);
        showStatus('Lista gare caricata.', false);
    } catch (error) {
        showStatus(`Errore nel caricamento delle gare: ${error.message}`, true);
        console.error('Fetch races error:', error);
    } finally {
        hideStatus();
    }
}


async function fetchRaceData(raceId) {
    showStatus(`Caricamento dati gara ${raceId}...`, false);
    try {
        const response = await fetch(`/api/race_data?race_id=${raceId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        currentRaceData = await response.json();
        showStatus(`Dati gara ${raceId} caricati.`, false);
        return true;
    } catch (error) {
        showStatus(`Errore nel caricamento dati gara ${raceId}: ${error.message}`, true);
        console.error('Fetch race data error:', error);
        return false;
    } finally {
        hideStatus();
    }
}

async function calculateResults(raceId, segmentClassifications) {
    showStatus('Calcolo classifiche in corso...', false);
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ race_id: raceId, segment_classifications: segmentClassifications })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const results = await response.json();
        lastCalculatedResults = results.single_race_results;
        lastCalculatedCumulative = results.cumulative_data;
        showStatus('Classifiche calcolate con successo!', false);
        return results;
    } catch (error) {
        showStatus(`Errore nel calcolo delle classifiche: ${error.message}`, true);
        console.error('Calculate results error:', error);
        return null;
    } finally {
        hideStatus();
    }
}

// --- UI Population & Event Handlers ---

function populateSelectGara(races) {
    selectGara.innerHTML = '<option value="">-- Scegli --</option>';
    races.forEach(raceId => {
        const option = document.createElement('option');
        option.value = raceId;
        option.textContent = `Gara ${raceId}`;
        selectGara.appendChild(option);
    });
    loadGaraBtn.disabled = false;
}

selectGara.addEventListener('change', () => {
    calcolaClassificheBtn.disabled = true; // Disable calculation until data is loaded
    segmentPanel.style.display = 'none'; // Hide segment panel on race change
    classificheDiv.innerHTML = ''; // Clear results
    hideStatus();
    downloadCumulativeBtn.disabled = true;
    downloadSingleBtn.disabled = true;
    downloadHtmlReportBtn.disabled = true;
    loadGaraBtn.disabled = !selectGara.value;
});

loadGaraBtn.addEventListener('click', async () => {
    const raceId = selectGara.value;
    if (!raceId) {
        showStatus('Seleziona una gara!', true);
        return;
    }

    const success = await fetchRaceData(raceId);
    if (success) {
        populateSegmentPanel(raceId, currentRaceData);
        calcolaClassificheBtn.disabled = false;
    }
});

function populateSegmentPanel(raceId, raceData) {
    segmentTableBody.innerHTML = '';
    garaSegmentoIdSpan.textContent = raceId;
    selectedSegments = {}; // Reset selections

    const uniqueSegments = new Set();
    CATEGORIE.forEach(cat => {
        if (raceData.fal[cat] && raceData.fal[cat].data) {
            raceData.fal[cat].data.forEach(sprint => {
                uniqueSegments.add(sprint.name + (sprint.lap ? ` (Lap ${sprint.lap})` : ''));
            });
        }
        if (raceData.fts[cat] && raceData.fts[cat].data) {
            raceData.fts[cat].data.forEach(sprint => {
                uniqueSegments.add(sprint.name + (sprint.lap ? ` (Lap ${sprint.lap})` : ''));
            });
        }
    });

    if (uniqueSegments.size === 0) {
        segmentPanel.style.display = 'none';
        showStatus('Nessun segmento Sprint/KOM trovato per questa gara.', false);
        return;
    }

    Array.from(uniqueSegments).sort().forEach(segmentName => {
        selectedSegments[segmentName] = 'NONE'; // Default classification
        const row = segmentTableBody.insertRow();
        row.innerHTML = `
            <td>${segmentName}</td>
            <td>
                <select data-segment="${segmentName}" onchange="handleSegmentClassificationChange(this)">
                    <option value="NONE">Nessuna</option>
                    <option value="SPRINT">Sprint ⚡</option>
                    <option value="KOM">KOM ⛰️</option>
                </select>
            </td>
        `;
    });
    segmentPanel.style.display = 'block';
    window.scrollTo(0, document.body.scrollHeight);
}

function handleSegmentClassificationChange(selectElement) {
    const segmentName = selectElement.dataset.segment;
    selectedSegments[segmentName] = selectElement.value;
}


calcolaClassificheBtn.addEventListener('click', async () => {
    const raceId = selectGara.value;
    if (!raceId) return;

    segmentPanel.style.display = 'none'; // Hide panel after selection

    const results = await calculateResults(raceId, selectedSegments);
    if (results) {
        renderResults(lastCalculatedResults, lastCalculatedCumulative);
        downloadCumulativeBtn.disabled = false;
        downloadSingleBtn.disabled = false;
        downloadHtmlReportBtn.disabled = false;
    }
});

downloadCumulativeBtn.addEventListener('click', () => {
    if (lastCalculatedCumulative) {
        downloadJsonFile(lastCalculatedCumulative, `cumulative_results_after_race_${selectGara.value}.json`);
    } else {
        showStatus('Nessuna classifica cumulativa disponibile per il download.', true);
    }
});

downloadSingleBtn.addEventListener('click', () => {
    if (lastCalculatedResults) {
        // Flatten single race results for easier consumption
        const flattenedSingleRaceResults = [];
        CATEGORIE.forEach(cat => {
            const catData = lastCalculatedResults[cat];
            const riderMap = new Map();

            ['punti', 'tempo', 'sprinter', 'climber'].forEach(classificationType => {
                if (catData[classificationType]) {
                    catData[classificationType].forEach((rider, index) => {
                        const entry = riderMap.get(rider.zwid) || { category: cat, name: rider.name, tname: rider.tname, zwid: rider.zwid, flag: rider.flag || '' };
                        entry[`${classificationType}_pos`] = index + 1;
                        if (classificationType === 'punti') {
                            entry.fal = rider.fal; entry.fts = rider.fts; entry.fin = rider.fin; entry.total = rider.total; entry.time = rider.time;
                        } else if (classificationType === 'tempo') {
                            entry.tempo_time = rider.time; entry.tempo_total = rider.total;
                        } else if (classificationType === 'sprinter') {
                            entry.pts_sprint = rider.pts_sprint; entry.sprinter_total = rider.total;
                        } else if (classificationType === 'climber') {
                            entry.pts_kom = rider.pts_kom; entry.climber_total = rider.total;
                        }
                        riderMap.set(rider.zwid, entry);
                    });
                }
            });
            riderMap.forEach(rider => flattenedSingleRaceResults.push(rider));
        });
        downloadJsonFile(flattenedSingleRaceResults, `gara_${selectGara.value}_results.json`);
    } else {
        showStatus('Nessuna classifica singola gara disponibile per il download.', true);
    }
});

downloadHtmlReportBtn.addEventListener('click', async () => {
    if (lastCalculatedResults && lastCalculatedCumulative) {
        showStatus('Generazione report HTML...', false);
        try {
            const response = await fetch('/api/generate_report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    race_id: selectGara.value,
                    single_race_results: lastCalculatedResults,
                    cumulative_data: lastCalculatedCumulative
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const htmlReport = await response.text();
            downloadHtmlFile(htmlReport, `report_gara_${selectGara.value}.html`);
            showStatus('Report HTML generato e scaricato.', false);
        } catch (error) {
            showStatus(`Errore nella generazione del report HTML: ${error.message}`, true);
            console.error('Generate HTML report error:', error);
        } finally {
            hideStatus();
        }
    } else {
        showStatus('Calcola prima le classifiche per generare il report HTML.', true);
    }
});


// --- Result Rendering (HTML generation, similar to old index.html) ---

function renderResults(singleRaceResults, cumulativeData) {
    classificheDiv.innerHTML = ''; // Clear previous results

    let totalRiders = 0;
    CATEGORIE.forEach(cat => totalRiders += singleRaceResults[cat].punti.length);
    const activeCategories = CATEGORIE.filter(cat => singleRaceResults[cat].punti.length > 0).length;

    // Stats Box
    classificheDiv.innerHTML += `
    <div class="container" style="margin-top: 20px; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px;">
        <div style="background: #333344; padding: 15px 25px; border-radius: 8px; text-align: center; flex: 1; min-width: 150px; border: 1px solid #444;">
            <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 5px;">Partecipanti</div>
            <div style="font-size: 28px; font-weight: bold; color: #4CAF50; line-height: 1.2;">${totalRiders}</div>
        </div>
        <div style="background: #333344; padding: 15px 25px; border-radius: 8px; text-align: center; flex: 1; min-width: 150px; border: 1px solid #444;">
            <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 5px;">Categorie Totali</div>
            <div style="font-size: 28px; font-weight: bold; color: #4CAF50; line-height: 1.2;">5</div>
        </div>
        <div style="background: #333344; padding: 15px 25px; border-radius: 8px; text-align: center; flex: 1; min-width: 150px; border: 1px solid #444;">
            <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 5px;">Cat. Attive</div>
            <div style="font-size: 28px; font-weight: bold; color: #4CAF50; line-height: 1.2;">${activeCategories}</div>
        </div>
    </div>`;

    CATEGORIE.forEach(cat => {
        const garaPunti = singleRaceResults[cat].punti;
        const garaTempo = singleRaceResults[cat].tempo;
        const garaSprinter = singleRaceResults[cat].sprinter;
        const garaClimber = singleRaceResults[cat].climber;

        // Re-sort cumulative data for display
        const cumResultsCat = cumulativeData.results[cat] || [];
        const cumPunti = [...cumResultsCat].sort((a, b) => (b.total || 0) - (a.total || 0) || (a.time || 0) - (b.time || 0));
        const cumTempo = [...cumResultsCat].filter(r => (r.time || 0) > 0).sort((a, b) => (a.time || Infinity) - (b.time || Infinity) || (b.total || 0) - (a.total || 0));
        const cumSprinter = [...cumResultsCat].filter(r => (r.pts_sprint || 0) > 0).sort((a, b) => (b.pts_sprint || 0) - (a.pts_sprint || 0) || (b.fts || 0) - (a.fts || 0));
        const cumClimber = [...cumResultsCat].filter(r => (r.pts_kom || 0) > 0).sort((a, b) => (b.pts_kom || 0) - (a.pts_kom || 0) || (b.fts || 0) - (a.fts || 0));

        if (garaPunti.length === 0) return; // Skip empty categories

        let html = `<h2>Categoria ${cat}</h2>`;

        // Helper to generate table HTML
        const generateTable = (title, data, colsConfig) => {
            if (!data || data.length === 0) return '';
            let tableHtml = `<h3>${title}</h3>`;
            tableHtml += `<table><thead><tr>`;
            colsConfig.forEach(col => {
                tableHtml += `<th${col.class ? ` class="${col.class}"` : ''}>${col.header}</th>`;
            });
            tableHtml += `</tr></thead><tbody>`;
            data.forEach((r, i) => {
                const posClass = i < 3 ? `pos-${i + 1}` : '';
                tableHtml += `<tr class="${posClass}">`;
                tableHtml += `<td>${i + 1}</td>`;
                colsConfig.forEach(col => {
                    if (col.key === 'position') return; // Position is handled by first td
                    let displayValue = r[col.key];
                    if (col.key === 'time' || col.key === 'tempo_time' || col.key === 'total_time') {
                        displayValue = (displayValue === 0 || displayValue === undefined) ? '<span class="no-time">DNF</span>' : formatTime(displayValue);
                    } else if (col.key === 'name') {
                        displayValue = createFlagHtml(r) + displayValue;
                    }
                    tableHtml += `<td${col.class ? ` class="${col.class}"` : ''}>${displayValue !== undefined ? displayValue : ''}</td>`;
                });
                tableHtml += `</tr>`;
            });
            tableHtml += `</tbody></table>`;
            return tableHtml;
        };

        // Column configurations for rendering
        const singlePuntiCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'FAL', key: 'fal' }, { header: 'FTS', key: 'fts' }, { header: 'FIN', key: 'fin' },
            { header: 'Totale', key: 'total', class: 'score-col' }, { header: 'Tempo', key: 'time' }
        ];
        const singleTempoCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Tempo', key: 'time', class: 'time-col' }, { header: 'Totale Punti', key: 'total' }
        ];
        const singleSprinterCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti Sprint', key: 'pts_sprint', class: 'score-col' }, { header: 'Totale Punti', key: 'total' }
        ];
        const singleClimberCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti KOM', key: 'pts_kom', class: 'score-col' }, { header: 'Totale Punti', key: 'total' }
        ];
        const cumPuntiCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'FAL', key: 'fal' }, { header: 'FTS', key: 'fts' }, { header: 'FIN', key: 'fin' },
            { header: 'Totale', key: 'total', class: 'score-col' }, { header: 'Tempo Tot.', key: 'time' }
        ];
        const cumTempoCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Tempo Totale', key: 'time', class: 'time-col' }, { header: 'Totale Punti', key: 'total' }
        ];
        const cumSprinterCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti Sprint', key: 'pts_sprint', class: 'score-col' }, { header: 'Punti Gara Tot.', key: 'total' }
        ];
        const cumClimberCols = [
            { header: 'Pos', key: 'position' }, { header: 'Rider', key: 'name' }, { header: 'Team', key: 'tname' },
            { header: 'Punti KOM', key: 'pts_kom', class: 'score-col' }, { header: 'Punti Gara Tot.', key: 'total' }
        ];


        html += generateTable(`Risultati Gara ${selectGara.value} - Classifica Punti 🥇`, garaPunti, singlePuntiCols);
        html += generateTable(`Risultati Gara ${selectGara.value} - Classifica Tempo ⏱️`, garaTempo, singleTempoCols);
        html += generateTable(`Risultati Gara ${selectGara.value} - Specialista Sprinter ⚡`, garaSprinter, singleSprinterCols);
        html += generateTable(`Risultati Gara ${selectGara.value} - Specialista Scalatore ⛰️`, garaClimber, singleClimberCols);
        html += generateTable(`Classifica Generale Punti dopo Gara ${selectGara.value} 🏆`, cumPunti, cumPuntiCols);
        html += generateTable(`Classifica Generale Specialista Sprinter ⚡`, cumSprinter, cumSprinterCols);
        html += generateTable(`Classifica Generale Specialista Scalatore ⛰️`, cumClimber, cumClimberCols);
        html += generateTable(`Classifica Generale Tempo Totale ⏱️`, cumTempo, cumTempoCols);

        classificheDiv.innerHTML += html;
    });
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    fetchRaces();
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
