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
      const res = await fetch('./portfolio_items.json');
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
  ofis: null,
  ilce: null,
  viewId: null,
  activeSeconds: 0,
  maxScrollDepth: 0,
  initialAlertSent: false,
  deepAlertSent: false,
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

// --- SUNUCUSUZ (SERVERLESS) ANLIK BİLDİRİM MOTORU ---
// Bilgisayar kapalı olsa dahi FormSubmit / Webhook / Telegram üzerinden 7/24 çalışır
function sendCloudAlert(alertType = "giris") {
  if (!PortfolioTracker.ref && !PortfolioTracker.ofis) return;

  if (alertType === "giris" && PortfolioTracker.initialAlertSent) return;
  if (alertType === "derin" && PortfolioTracker.deepAlertSent) return;

  if (alertType === "giris") PortfolioTracker.initialAlertSent = true;
  if (alertType === "derin") PortfolioTracker.deepAlertSent = true;

  const ofisName = PortfolioTracker.ofis || ("Mimarlık Ofisi (ID: " + PortfolioTracker.ref + ")");
  const ilceStr = PortfolioTracker.ilce ? ` (${PortfolioTracker.ilce})` : "";
  const topInterest = getTopInterest();
  const timeNow = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  let payload = {
    _template: "table",
    _captcha: "false"
  };

  if (alertType === "giris") {
    payload._subject = `🔥 SICAK MÜŞTERİ: ${ofisName}${ilceStr} Portfolyonuzu Açtı!`;
    payload["🔔 Durum"] = "🔥 Bir mimarlık ofisi az önce e-postanızdaki portfolyo linkine tıkladı!";
    payload["🏢 Ofis Adı"] = ofisName;
    payload["📍 İlçe / Şehir"] = PortfolioTracker.ilce || "Belirtilmemiş";
    payload["🕒 Giriş Saati"] = timeNow;
    payload["💡 Sıcak İletişim Önerisi"] = "Müşteri şu anda sitenizde geziniyor. WhatsApp veya e-posta ile sıcağı sıcağına iletişime geçebilirsiniz.";
  } else {
    payload._subject = `⭐ YÜKSEK İLGİ: ${ofisName} Portfolyonuzu İnceledi! (${PortfolioTracker.activeSeconds} sn)`;
    payload["🔔 Durum"] = "⭐ Ofis portfolyonuzda vakit geçirdi ve çalışmalarınızı detaylıca inceledi!";
    payload["🏢 Ofis Adı"] = ofisName;
    payload["⏱️ Sayfada Kaldığı Süre"] = `${PortfolioTracker.activeSeconds} saniye`;
    payload["🎯 En Çok İlgilendiği Alan"] = topInterest.name;
    payload["📂 Tıkladığı Projeler"] = PortfolioTracker.clickedProjects.length > 0 ? PortfolioTracker.clickedProjects.join(", ") : "Genel Portfolyo Galerisi";
    payload["📜 Sayfa Kaydırma Oranı"] = `%${PortfolioTracker.maxScrollDepth}`;
    payload["🕒 Saat"] = timeNow;
  }

  // 1. E-POSTA BİLDİRİMİ (FormSubmit Serverless API - 7/24 Kesintisiz)
  try {
    fetch("https://formsubmit.co/ajax/asozcan2525@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}

  // 2. TELEGRAM BİLDİRİMİ (Tanımlıysa anında sesli mesaj)
  if (window.TELEGRAM_CONFIG && window.TELEGRAM_CONFIG.bot_token && window.TELEGRAM_CONFIG.chat_id) {
    try {
      const text = alertType === "giris"
        ? `🔥 <b>SICAK MÜŞTERİ ALARMI!</b>\n\n🏢 <b>Ofis:</b> ${ofisName}${ilceStr}\n🕒 <b>Saat:</b> ${timeNow}\n\n💡 <i>Bir mimarlık ofisi az önce portfolyonuzu açtı!</i>`
        : `⭐ <b>YÜKSEK İLGİ BİLDİRİMİ!</b>\n\n🏢 <b>Ofis:</b> ${ofisName}\n⏱️ <b>Süre:</b> ${PortfolioTracker.activeSeconds} sn\n🎯 <b>İlgi Alanı:</b> ${topInterest.name}\n\n💼 <i>Detaylı inceleme tamamlandı!</i>`;

      fetch(`https://api.telegram.org/bot${window.TELEGRAM_CONFIG.bot_token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: window.TELEGRAM_CONFIG.chat_id,
          text: text,
          parse_mode: "HTML"
        })
      }).catch(() => {});
    } catch (e) {}
  }

  // 3. Yerel Flask Sunucusuna da Bildir (Eğer bilgisayar açıksa SQLite'a da yazsın)
  try {
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: PortfolioTracker.ref, referrer: document.referrer || 'E-posta' })
    }).catch(() => {});
  } catch (e) {}
}

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
    PortfolioTracker.categoryScores[cat] += 25;
  }
  
  // 2 veya daha fazla projeye tıklarsa hemen derin ilgi bildirimi at
  if (PortfolioTracker.clickedProjects.length >= 2 && !PortfolioTracker.deepAlertSent) {
    sendCloudAlert("derin");
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
  
  if (maxScore <= 0 && PortfolioTracker.sectionsTime.animasyonlar > 15) {
    bestCat = 'video';
  }
  
  return {
    key: bestCat,
    name: PortfolioTracker.categoryNames[bestCat] || 'D5 Render & Mimari Görselleştirme'
  };
}

function sendReadingAnalytics(immediate = false) {
  if (!PortfolioTracker.ref && !PortfolioTracker.ofis) return;
  
  const now = Date.now();
  if (!immediate && (now - PortfolioTracker.lastSyncTime < 6000)) {
    return;
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
    }).catch(() => {});
  } catch (e) {}
}

function initPortfolioTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref') || urlParams.get('lid') || urlParams.get('id');
  const ofisParam = urlParams.get('ofis');
  const ilceParam = urlParams.get('ilce');

  if (!ref && !ofisParam) return;

  PortfolioTracker.ref = ref;
  if (ofisParam) PortfolioTracker.ofis = decodeURIComponent(ofisParam.replace(/\+/g, ' '));
  if (ilceParam) PortfolioTracker.ilce = decodeURIComponent(ilceParam.replace(/\+/g, ' '));

  console.log("⚡ Portfolyo Analizi Başlatıldı:", PortfolioTracker.ofis || PortfolioTracker.ref);

  // 1. Sayfa açıldıktan 1.5 saniye sonra ilk Sıcak Müşteri uyarısı buluta iletilir
  setTimeout(() => {
    sendCloudAlert("giris");
  }, 1500);

  // 1 Saniyelik Aktif Zaman Sayacı
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      PortfolioTracker.activeSeconds += 1;
      if (PortfolioTracker.currentSection && PortfolioTracker.sectionsTime[PortfolioTracker.currentSection] !== undefined) {
        PortfolioTracker.sectionsTime[PortfolioTracker.currentSection] += 1;
      }
      
      // Ziyaretçi 25 saniye sayfada kalırsa derin ilgi uyarısını otomatik gönder
      if (PortfolioTracker.activeSeconds === 25 && !PortfolioTracker.deepAlertSent) {
        sendCloudAlert("derin");
      }
    }
  }, 1000);

  // Her 10 saniyede bir yerel senkronizasyon (bilgisayar açıksa)
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

  // Bölüm Geçiş Gözlemcisi
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

  // Sayfadan çıkış anında derin inceleme gönderimi (en az 12 saniye durduysa)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (PortfolioTracker.activeSeconds >= 12 && !PortfolioTracker.deepAlertSent) {
        sendCloudAlert("derin");
      }
      sendReadingAnalytics(true);
    }
  });
}
