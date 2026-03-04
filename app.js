const PASSWORD = 'kloakontroll2026';
const SUPABASE_URL = 'https://kvniauxokdtmpvjtfnej.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmlhdXhva2R0bXB2anRmbmVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM2NzIzNCwiZXhwIjoyMDY2OTQzMjM0fQ.OkhTtq9QAQ3xMzZYKyWyCjj7PiqMZJKSvpA0jcBJqpE';
const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';
const CREATED_BY = '10aa1508-6d52-490c-8ae5-fa3da9a152c4';

function doLogin() {
    const input = document.getElementById('password-input').value;
    if (input === PASSWORD) {
        localStorage.setItem('mc_auth', 'true');
        showApp();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function doLogout() {
    localStorage.removeItem('mc_auth');
    location.reload();
}

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('saksliste-date').value = tomorrow.toISOString().split('T')[0];
    initApp();
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(section).classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    if (section === 'saksliste') loadSaker();
    if (section === 'stats') loadStats();
}

async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function initApp() {
    await loadDashboard();
}

async function loadDashboard() {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const saker = await supabaseRequest(`/agenda_items?tenant_id=eq.${TENANT_ID}&show_date=eq.${tomorrowStr}`);
        document.getElementById('dash-saker').textContent = saker.length;
        
        const radioStats = await supabaseRequest(`/nielsen_weekly_metrics?channel=eq.NRJ&order=created_at.desc&limit=1`);
        if (radioStats[0]) {
            document.getElementById('dash-radio').textContent = (radioStats[0].value / 1000).toFixed(1) + 'k';
        } else {
            document.getElementById('dash-radio').textContent = '-';
        }
        
        const podcastStats = await supabaseRequest(`/podtoppen_weekly_data?podcast_title=eq.NRJ%20Morgen%20Podkast&order=created_at.desc&limit=1`);
        if (podcastStats[0]) {
            document.getElementById('dash-podcast').textContent = '#' + podcastStats[0].rank;
        } else {
            document.getElementById('dash-podcast').textContent = '-';
        }
        
        document.getElementById('dash-status').innerHTML = `
            <div class="alert alert-success">
                ✅ Tilkoblet! ${saker.length} saker for ${tomorrowStr}
            </div>
        `;
    } catch (error) {
        document.getElementById('dash-status').innerHTML = `<div class="alert alert-error">❌ ${error.message}</div>`;
    }
}

async function loadSaker() {
    const container = document.getElementById('saksliste-content');
    const date = document.getElementById('saksliste-date').value;
    container.innerHTML = '<div class="loading">Laster...</div>';
    
    try {
        const saker = await supabaseRequest(`/agenda_items?tenant_id=eq.${TENANT_ID}&show_date=eq.${date}&order=order_index.asc`);
        
        if (saker.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: #94a3b8;">Ingen saker for ${date}</p>`;
            return;
        }

        container.innerHTML = saker.map((sak, i) => `
            <div style="display: flex; gap: 1rem; padding: 1rem; background: #1e293b; border-radius: 0.5rem; margin-bottom: 0.75rem;">
                <div style="width: 32px; height: 32px; background: #6366f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">${i + 1}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${sak.title}</div>
                    <div style="font-size: 0.875rem; color: #94a3b8;">${sak.category || 'TALK'}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">❌ ${error.message}</div>`;
    }
}

async function loadStats() {
    try {
        const radio = await supabaseRequest(`/nielsen_weekly_metrics?channel=eq.NRJ&order=created_at.desc&limit=5`);
        if (radio.length > 0) {
            document.getElementById('radio-stats').innerHTML = radio.map(r => `
                <div style="padding: 1rem; background: #1e293b; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                    <strong>Uke ${r.week_number}, ${r.year}</strong>: ${r.value.toLocaleString()} lyttere
                </div>
            `).join('');
        } else {
            document.getElementById('radio-stats').innerHTML = '<p style="color: #94a3b8;">Ingen data</p>';
        }
        
        const podcast = await supabaseRequest(`/podtoppen_weekly_data?podcast_title=eq.NRJ%20Morgen%20Podkast&order=created_at.desc&limit=5`);
        if (podcast.length > 0) {
            document.getElementById('podcast-stats').innerHTML = podcast.map(p => `
                <div style="padding: 1rem; background: #1e293b; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                    <strong>Uke ${p.week_number}</strong>: Rank #${p.rank} • ${p.unique_units?.toLocaleString() || 0} unike
                </div>
            `).join('');
        } else {
            document.getElementById('podcast-stats').innerHTML = '<p style="color: #94a3b8;">Ingen data</p>';
        }
    } catch (error) {
        document.getElementById('radio-stats').innerHTML = `<div class="alert alert-error">❌ ${error.message}</div>`;
    }
}

if (localStorage.getItem('mc_auth') === 'true') {
    showApp();
}

setInterval(() => {
    if (document.getElementById('app').style.display === 'block') {
        loadDashboard();
    }
}, 300000);
