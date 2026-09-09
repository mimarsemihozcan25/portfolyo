// AHMET SEMİH ÖZCAN - PORTFOLYO İÇERİK & ETKİLEŞİM MOTORU
let allPortfolioItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadPortfolioData();
  setupFilterButtons();
  setupSmoothScroll();
  initPortfolioTracking();
});

async function loadPortfolioData() {
  try {
    if (window.PRELOADED_PORTFOLIO_ITEMS && Array.isArray(window.PRELOADED_PORTFOLIO_ITEMS) && window.PRELOADED_PORTFOLIO_ITEMS.length > 0) {
      allPortfolioItems = window.PRELOADED_PORTFOLIO_ITEMS;
    } else {
      const res = await fetch('/portfolio/portfolio_items.json');
      allPortfolioItems = await res.json();
    }
    
    updateCategoryCounts();
    renderGallery(allPortfolioItems);
  } catch (err) {
    console.error("Portfolyo verisi yüklenemedi:", err);
  }
}

function updateCategoryCounts() {
  document.getElementById('countAll').innerText = allPortfolioItems.length;
  
  const videoCount = allPortfolioItems.filter(i => i.type === 'video').length;
  const d5Count = allPortfolioItems.filter(i => i.category_id === 'd5').length;
  const aiCount = allPortfolioItems.filter(i => i.category_id === 'ai').length;
  const paftaCount = allPortfolioItems.filter(i => i.category_id === 'pafta').length;
  const autocadCount = allPortfolioItems.filter(i => i.category_id === 'autocad').length;
  const detayCount = allPortfolioItems.filter(i => i.category_id === 'detay').length;
  const archicadCount = allPortfolioItems.filter(i => i.category_id === 'archicad').length;

  document.getElementById('countVideo').innerText = videoCount;
  document.getElementById('countD5').innerText = d5Count;
  document.getElementById('countAI').innerText = aiCount;
  document.getElementById('countPafta').innerText = paftaCount;
  document.getElementById('countAutocad').innerText = autocadCount;
  document.getElementById('countDetay').innerText = detayCount;
  document.getElementById('countArchicad').innerText = archicadCount;
}

function renderGallery(items) {
  const container = document.getElementById('portfolioGallery');
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem;">Bu kategoride henüz çalışma bulunmuyor.</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', item.category_id);
    card.setAttribute('data-type', item.type);

    let mediaHTML = '';
    let badgeHTML = '';
    let actionText = '';

    if (item.type === 'video') {
      badgeHTML = `<span class="type-indicator-badge type-video">🎬 VİDEO ANİMASYON</span>`;
      mediaHTML = `
        <video muted loop playsinline preload="metadata">
          <source src="${item.file_url}" type="video/mp4">
        </video>
        <div class="play-icon-overlay">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      `;
      actionText = 'Videoyu İzle &rarr;';
    } else if (item.type === 'pdf') {
      badgeHTML = `<span class="type-indicator-badge type-pdf">📑 PDF ÇİZİM / PAFTA</span>`;
      mediaHTML = `
        <img src="${item.thumb_url}" alt="${item.title}" loading="lazy">
      `;
      actionText = 'Çizimi / Paftayı İncele &rarr;';
    } else {
      badgeHTML = `<span class="type-indicator-badge type-image">📸 4K RENDER</span>`;
      mediaHTML = `
        <img src="${item.thumb_url}" alt="${item.title}" loading="lazy">
      `;
      actionText = 'Görseli İncele &rarr;';
    }

    card.innerHTML = `
      <div class="card-media-wrap">
        ${badgeHTML}
        ${mediaHTML}
      </div>
      <div class="card-details">
        <span class="card-category-tag">${item.tag}</span>
        <h4>${item.title}</h4>
        <div class="card-footer-action">
          <span>${item.category_name}</span>
          <span class="action-text">${actionText}</span>
        </div>
      </div>
    `;

    // Hover oynatma desteği (video kartları için)
    if (item.type === 'video') {
      const vid = card.querySelector('video');
      card.addEventListener('mouseenter', () => {
        vid.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        vid.pause();
        vid.currentTime = 0;
      });
    }

    // Tıklama ile Cinema Modalı Açma
    card.addEventListener('click', () => {
      openMediaModal(item);
    });

    container.appendChild(card);
  });
}

function setupFilterButtons() {
  const filterBtns = document.querySelectorAll('.cat-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      if (typeof trackCategoryInterest === 'function') {
        trackCategoryInterest(filter);
      }
      
      if (filter === 'all') {
        renderGallery(allPortfolioItems);
      } else if (filter === 'video') {
        renderGallery(allPortfolioItems.filter(i => i.type === 'video'));
      } else {
        renderGallery(allPortfolioItems.filter(i => i.category_id === filter));
      }
    });
  });
}

function openMediaModal(item) {
  if (typeof trackProjectClick === 'function') {
    trackProjectClick(item);
  }

  const modal = document.getElementById('mediaModal');
  const body = document.getElementById('modalBody');
  const title = document.getElementById('modalTitle');
  const tag = document.getElementById('modalTag');
  const actions = document.getElementById('modalActions');

  title.innerText = item.title;
  tag.innerText = item.tag + " • " + item.category_name;

  if (item.type === 'video') {
    body.innerHTML = `
      <video controls autoplay playsinline loop style="width:100%; height:100%; object-fit:contain;">
        <source src="${item.file_url}" type="video/mp4">
      </video>
    `;
    actions.innerHTML = `
      <a href="${item.file_url}" download class="btn btn-secondary" style="padding:0.5rem 1rem; font-size:0.8rem;">
        Videoyu İndir
      </a>
    `;
  } else if (item.type === 'pdf') {
    body.innerHTML = `
      <iframe src="${item.file_url}#toolbar=1" style="width:100%; height:100%;"></iframe>
    `;
    actions.innerHTML = `
      <a href="${item.file_url}" target="_blank" class="btn btn-primary" style="padding:0.5rem 1rem; font-size:0.8rem;">
        PDF'i Yeni Sekmede Tam Ekran Aç
      </a>
      <a href="${item.file_url}" download class="btn btn-secondary" style="padding:0.5rem 1rem; font-size:0.8rem;">
        PDF İndir
      </a>
    `;
  } else {
    body.innerHTML = `
      <img src="${item.file_url}" alt="${item.title}">
    `;
    actions.innerHTML = `
      <a href="${item.file_url}" target="_blank" class="btn btn-primary" style="padding:0.5rem 1rem; font-size:0.8rem;">
        Orijinal Çözünürlükte Gör
      </a>
    `;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMediaModal() {
  const modal = document.getElementById('mediaModal');
  const body = document.getElementById('modalBody');
  // Video varsa sesi ve oynatmayı durdur
  const vid = body.querySelector('video');
  if (vid) {
    vid.pause();
    vid.src = '';
  }
  body.innerHTML = '';
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// ESC tuşu ile kapatma
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMediaModal();
  }
});

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// --- PORTFOLYO DERİN OKUMA & BÖLÜM TAKİBİ (ADVANCED ANALYTICS TRACKER) ---
const PortfolioTracker = {
  ref: null,
  viewId: null,
  activeSeconds: 0,
  maxScrollDepth: 0,
  categoryScores: {
    d5: 0,
    archicad: 0,
    pafta: 0,
    autocad: 0,
    video: 0,
    ai: 0,
    detay: 0
  },
  categoryNames: {
    d5: "D5 Render Kesitleri & Görseller",
    archicad: "ArchiCAD Taşıyıcı & BIM Modelleri",
    pafta: "Pafta Tasarımları & Kurgu",
    autocad: "AutoCAD Teknik Çizimleri",
    video: "3D Sinematik Mimari Animasyonlar",
    ai: "Yapay Zekâ Destekli Konseptler",
    detay: "Sistem & İmalat Detayları"
  },
  clickedProjects: [],
  sectionsTime: {
    hero: 0,
    animasyonlar: 0,
    projeler: 0,
    hakkimda: 0,
    iletisim: 0
  },
  currentSection: 'hero',
  lastSyncTime: 0
};

function trackCategoryInterest(filter) {
  if (!filter || filter === 'all') return;
  if (PortfolioTracker.categoryScores[filter] !== undefined) {
    PortfolioTracker.categoryScores[filter] += 15;
    sendReadingAnalytics(false);
  }
}

function trackProjectClick(item) {
  if (!item) return;
  const title = item.title || 'Mimari Çalışma';
  if (!PortfolioTracker.clickedProjects.includes(title)) {
    PortfolioTracker.clickedProjects.push(title);
  }
  const cat = item.category_id || (item.type === 'video' ? 'video' : 'd5');
  if (PortfolioTracker.categoryScores[cat] !== undefined) {
    PortfolioTracker.categoryScores[cat] += 25; // Detaylı inceleme en yüksek ilgi puanıdır
  }
  sendReadingAnalytics(true);
}

function getTopInterest() {
  let bestCat = 'd5';
  let maxScore = -1;
  for (const [cat, score] of Object.entries(PortfolioTracker.categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCat = cat;
    }
  }
  
  // Eğer henüz belirgin bir kategoriye tıklamadıysa ama animasyonlar bölümünde çok kaldıysa:
  if (maxScore <= 0 && PortfolioTracker.sectionsTime.animasyonlar > 15) {
    bestCat = 'video';
  }
  
  return {
    key: bestCat,
    name: PortfolioTracker.categoryNames[bestCat] || 'D5 Render & Mimari Görselleştirme'
  };
}

function sendReadingAnalytics(immediate = false) {
  if (!PortfolioTracker.ref) return;
  
  const now = Date.now();
  if (!immediate && (now - PortfolioTracker.lastSyncTime < 6000)) {
    return; // Çok sık istek atıp sunucuyu yorma
  }
  PortfolioTracker.lastSyncTime = now;

  const top = getTopInterest();
  const payload = {
    lead_id: PortfolioTracker.ref,
    view_id: PortfolioTracker.viewId,
    duration_seconds: PortfolioTracker.activeSeconds,
    top_category: top.key,
    top_category_name: top.name,
    clicked_items: PortfolioTracker.clickedProjects,
    scroll_depth: PortfolioTracker.maxScrollDepth,
    sections_breakdown: PortfolioTracker.sectionsTime
  };

  try {
    fetch('/api/track-reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(res => {
      if (res && res.view_id && !PortfolioTracker.viewId) {
        PortfolioTracker.viewId = res.view_id;
      }
    }).catch(() => {});
  } catch (e) {}
}

function initPortfolioTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref') || urlParams.get('lid') || urlParams.get('id');
  if (!ref) return;

  PortfolioTracker.ref = ref;

  // İlk giriş kaydı ve Sıcak Müşteri uyarısı
  fetch('/api/track-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: ref,
      referrer: document.referrer || 'Doğrudan E-posta Linki'
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data && data.view_id) {
      PortfolioTracker.viewId = data.view_id;
      console.log("⚡ Derin Portfolyo Analizi Başlatıldı. Ziyaret ID:", PortfolioTracker.viewId);
    }
  })
  .catch(e => console.log("Takip başlatılamadı:", e));

  // 1 Saniyelik Aktif Zaman Sayacı (Sekme arka planda ise saymaz)
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      PortfolioTracker.activeSeconds += 1;
      if (PortfolioTracker.currentSection && PortfolioTracker.sectionsTime[PortfolioTracker.currentSection] !== undefined) {
        PortfolioTracker.sectionsTime[PortfolioTracker.currentSection] += 1;
      }
    }
  }, 1000);

  // Her 10 saniyede bir verileri sunucuya senkronize et
  setInterval(() => {
    sendReadingAnalytics(false);
  }, 10000);

  // Scroll derinliği hesaplayıcı
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const currentScroll = Math.round((window.scrollY / totalHeight) * 100);
      if (currentScroll > PortfolioTracker.maxScrollDepth) {
        PortfolioTracker.maxScrollDepth = currentScroll;
      }
    }
  }, { passive: true });

  // Bölüm Geçiş Gözlemcisi (Hangi bölümde ne kadar durdu?)
  const sections = document.querySelectorAll('section[id], header');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          const id = entry.target.getAttribute('id') || 'hero';
          PortfolioTracker.currentSection = id;
          if (id === 'animasyonlar') {
            PortfolioTracker.categoryScores.video += 1;
          }
        }
      });
    }, { threshold: [0.4] });

    sections.forEach(s => observer.observe(s));
  }

  // Video oynatma takibi
  const v1 = document.getElementById('v1');
  const v2 = document.getElementById('v2');
  if (v1) {
    v1.addEventListener('play', () => {
      trackProjectClick({ title: 'Kumbaş Villa 3D Mimari Animasyon', category_id: 'video', type: 'video' });
    });
  }
  if (v2) {
    v2.addEventListener('play', () => {
      trackProjectClick({ title: 'Yapay Zekâ Destekli Mimari Konsept Animasyonu', category_id: 'ai', type: 'video' });
    });
  }

  // Sayfadan çıkış anında kayıpsız gönderim (Beacon)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const top = getTopInterest();
      const payload = JSON.stringify({
        lead_id: PortfolioTracker.ref,
        view_id: PortfolioTracker.viewId,
        duration_seconds: PortfolioTracker.activeSeconds,
        top_category: top.key,
        top_category_name: top.name,
        clicked_items: PortfolioTracker.clickedProjects,
        scroll_depth: PortfolioTracker.maxScrollDepth,
        sections_breakdown: PortfolioTracker.sectionsTime
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track-reading', new Blob([payload], { type: 'application/json' }));
      }
    }
  });
}
