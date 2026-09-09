import os
import sys
import json
import shutil
import pypdfium2 as pdfium
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
THUMBS_DIR = os.path.join(ASSETS_DIR, "thumbs")
CLEAN_DIR = os.path.join(ASSETS_DIR, "files")
os.makedirs(THUMBS_DIR, exist_ok=True)
os.makedirs(CLEAN_DIR, exist_ok=True)

# Kategori Eşleştirmeleri ve Şık İsimler
CATEGORY_MAP = {
    "D5 Render": {
        "id": "d5",
        "name": "D5 Render & 3D Görselleştirme",
        "tag": "D5 RENDER / 4K"
    },
    "Ai destekli Renderlar": {
        "id": "ai",
        "name": "Yapay Zekâ (AI) Destekli Render & Animasyon",
        "tag": "AI ARCHITECTURE"
    },
    "Örnek Pafta Düzenleri": {
        "id": "pafta",
        "name": "Örnek Pafta Tasarımları & Sunum",
        "tag": "PAFTA DÜZENİ / BIM"
    },
    "Teknik Çizim Autocad": {
        "id": "autocad",
        "name": "AutoCAD Teknik Çizim & Kat Planları",
        "tag": "AUTOCAD / DWG"
    },
    "detay": {
        "id": "detay",
        "name": "Mimari Sistem & Merdiven Detayları",
        "tag": "UYGULAMA PROJESİ"
    },
    "Örnek Çizim archicad": {
        "id": "archicad",
        "name": "ArchiCAD Çizim & Taşıyıcı Sistem",
        "tag": "ARCHICAD PROJE"
    }
}

def clean_filename(name):
    """Web uyumlu temiz dosya adı oluşturur."""
    tr_map = {
        'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c', ' ': '_'
    }
    cleaned = ""
    for char in name:
        cleaned += tr_map.get(char, char)
    # Sadece harf, rakam, alt çizgi ve nokta bırak
    import re
    cleaned = re.sub(r'[^a-zA-Z0-9._-]', '', cleaned)
    return cleaned

def generate_pdf_thumbnail(pdf_path, thumb_path):
    """PDF'in ilk sayfasını yüksek kaliteli PNG olarak kaydeder."""
    try:
        pdf = pdfium.PdfDocument(pdf_path)
        page = pdf[0]
        # 150 DPI render
        image = page.render(scale=2.0).to_pil()
        image.save(thumb_path, "PNG", quality=90)
        return True
    except Exception as e:
        print(f"PDF Render hatası ({pdf_path}): {e}")
        return False

def process_all_assets():
    items = []
    
    for folder_name in os.listdir(ASSETS_DIR):
        folder_path = os.path.join(ASSETS_DIR, folder_name)
        if not os.path.isdir(folder_path) or folder_name in ["thumbs", "files"]:
            continue
            
        cat_info = None
        for key, val in CATEGORY_MAP.items():
            if clean_filename(key).lower() in clean_filename(folder_name).lower() or folder_name == key:
                cat_info = val
                break
        if not cat_info:
            cat_info = {
                "id": clean_filename(folder_name).lower(),
                "name": folder_name,
                "tag": "MİMARİ"
            }

        for fname in os.listdir(folder_path):
            fpath = os.path.join(folder_path, fname)
            if not os.path.isfile(fpath):
                continue
                
            ext = os.path.splitext(fname)[1].lower()
            clean_name = f"{cat_info['id']}_{clean_filename(fname)}"
            target_fpath = os.path.join(CLEAN_DIR, clean_name)
            shutil.copy2(fpath, target_fpath)
            
            rel_file_url = f"/portfolio/assets/files/{clean_name}"
            item_type = "other"
            thumb_url = rel_file_url
            
            # Başlık güzelleştirme
            base_title = os.path.splitext(fname)[0]
            clean_title = base_title.replace("_", " ").replace("-", " ")
            if "porsche" in clean_title.lower():
                clean_title = "Modern Lüks Villa & Araç Renderı"
            elif "apartman" in clean_title.lower():
                clean_title = "Apartman Konsept Dış Cephe Renderı"
            elif "kumba" in clean_title.lower() and "video" in clean_title.lower() or ext == ".mp4" and "kumba" in clean_title.lower():
                clean_title = "Kumbaş Villa 3D Mimari Animasyon & Sinematik Tur"
            elif "kumba" in clean_title.lower():
                clean_title = "Kumbaş Villa Dış Mekan Proje Renderı"
            elif "merdiven" in clean_title.lower():
                clean_title = "Merdiven Sistem & İmalat Detay Çizimi"
            elif "a0_detay" in clean_title.lower() or "1220802065" in clean_title:
                clean_title = "A0 Mimari Sistem & Uygulama Detay Paftası"
            elif "analiz" in clean_title.lower():
                clean_title = "Kentsel & Mimari Analiz Sunum Paftası"
            elif "zemin" in clean_title.lower():
                clean_title = "Zemin Kat Mimari Tefrişli Uygulama Planı"
            elif "kolon" in clean_title.lower():
                clean_title = "ArchiCAD Kolon - Kiriş Taşıyıcı Sistem Detayı"
            elif "upscale" in clean_title.lower() or "scene" in clean_title.lower():
                clean_title = f"D5 Render 4K Mekan Görselleştirmesi"
            elif ext == ".mp4":
                clean_title = "Mimari Yapay Zekâ Destekli Konsept Animasyonu"

            # Tür Kontrolü
            if ext in [".mp4", ".mov", ".webm"]:
                item_type = "video"
                # Video için özel placeholder veya thumbnail
                thumb_url = rel_file_url
            elif ext in [".jpg", ".jpeg", ".png", ".webp"]:
                item_type = "image"
                thumb_url = rel_file_url
            elif ext == ".pdf":
                item_type = "pdf"
                thumb_name = f"thumb_{os.path.splitext(clean_name)[0]}.png"
                thumb_path = os.path.join(THUMBS_DIR, thumb_name)
                success = generate_pdf_thumbnail(target_fpath, thumb_path)
                if success:
                    thumb_url = f"/portfolio/assets/thumbs/{thumb_name}"
                else:
                    thumb_url = ""

            items.append({
                "id": clean_name,
                "category_id": cat_info["id"],
                "category_name": cat_info["name"],
                "tag": cat_info["tag"],
                "title": clean_title,
                "original_filename": fname,
                "type": item_type,
                "file_url": rel_file_url,
                "thumb_url": thumb_url
            })

    output_json_path = os.path.join(BASE_DIR, "portfolio_items.json")
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    print(f"Toplam {len(items)} portfolyo içeriği başarıyla işlendi ve indekslendi.")
    return items

if __name__ == "__main__":
    items = process_all_assets()
    for it in items:
        print(f"[{it['type'].upper()}] ({it['category_name']}) - {it['title']}")
