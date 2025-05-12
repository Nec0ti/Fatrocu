# backend/fatrocu_app/services/gemini_processor.py

import google.generativeai as genai
from flask import current_app
import os
import json
import traceback # Hata ayıklama için

# --- Sabitler ---
# KULLANILACAK MODEL ADI - İSTEĞİN ÜZERİNE GÜNCELLENDİ
# DİKKAT: Bu model adının API anahtarınızla erişilebilir olduğundan emin olun!
# Eğer erişiminiz yoksa 'gemini-1.5-pro-latest' veya 'gemini-1.5-flash-latest' kullanın.
GEMINI_MODEL_NAME = 'models/gemini-2.5-pro-exp-03-25' # Google API'leri genellikle bu formatı kullanır (veya sadece 'gemini-2.5-pro-preview-0606') - Doğru adı kontrol et!

# JSON formatında çıktı alınmasını sağlayacak detaylı prompt
# (Prompt içeriği aynı kalabilir)
EXTRACTION_PROMPT = """
GÖREV: Sağlanan fatura belgesini (PDF veya Resim) dikkatlice analiz et.
ÇIKTI FORMATI: Aşağıda belirtilen alanları çıkarıp **sadece ve sadece geçerli bir JSON nesnesi** olarak yanıt ver. JSON dışında KESİNLİKLE başka bir metin ekleme (açıklama, giriş, sonuç yazma).

İSTENEN ALANLAR (JSON Anahtarları ve Açıklamaları):
- "fatura_no": Faturanın/Belgenin üzerinde yazan benzersiz numara (Seri ve Sıra No birleşik olabilir, örn: "ABC20240000123"). Bulunamazsa null.
- "tarih": Faturanın düzenlenme tarihi (Format: "GG.AA.YYYY"). Bulunamazsa null.
- "satici_vkn_tckn": Satıcı firmanın/şahsın Vergi Kimlik Numarası (10 hane VKN) veya TC Kimlik Numarası (11 hane TCKN). Sadece rakamları içermeli. Bulunamazsa null.
- "firma_unvan": Satıcı firmanın/şahsın tam ticari ünvanı veya adı soyadı. Bulunamazsa null.
- "alici_vkn_tckn": Alıcı firmanın/şahsın VKN veya TCKN'si (varsa). Sadece rakamları içermeli. Bulunamazsa veya okunamazsa null.
- "alici_firma_unvan": Alıcı firmanın/şahsın tam ünvanı veya adı soyadı (varsa). Bulunamazsa veya okunamazsa null.
- "kdv_matrah": KDV hesaplamasına esas alınan tutar(lar)ın toplamı (KDV hariç genel ara toplam). Sayısal (float) değer olmalı. Bulunamazsa null.
- "kdv_orani": Faturadaki en yaygın veya ana KDV oranı (%). Sadece sayısal değer (örn: 20, 10, 1, 0). Birden fazla farklı oran varsa veya belirlenemiyorsa null.
- "kdv_tutari": Hesaplanan toplam KDV tutarı. Sayısal (float) değer olmalı. Bulunamazsa null.
- "genel_toplam": Faturanın tüm vergiler dahil ödenecek nihai toplam tutarı. Sayısal (float) değer olmalı. Bulunamazsa null.

KURALLAR:
1.  Yanıt SADECE JSON formatında olmalı. ```json ... ``` gibi işaretleyiciler KULLANMA.
2.  Değerler bulunamazsa veya okunamıyorsa JSON içinde anahtarın değeri `null` olmalı.
3.  Tarih "GG.AA.YYYY" formatında olmalı. Farklı formatta bulursan bu formata çevir.
4.  VKN/TCKN alanları sadece rakamlardan oluşmalı.
5.  Sayısal alanlar (matrah, tutar, toplam) ondalık ayracı olarak nokta (.) kullanılarak float tipinde olmalı. Binlik ayıracı KULLANMA.
6.  Para birimi sembollerini (TL, $, € vb.) sayısal değerlere EKLEME.

ÖRNEK GEÇERLİ JSON ÇIKTISI:
{
  "fatura_no": "FAT202412345",
  "tarih": "21.07.2024",
  "satici_vkn_tckn": "1234567890",
  "firma_unvan": "SATICI ANONİM ŞİRKETİ",
  "alici_vkn_tckn": "09876543210",
  "alici_firma_unvan": "ALICI LİMİTED ŞİRKETİ",
  "kdv_matrah": 2500.50,
  "kdv_orani": 20,
  "kdv_tutari": 500.10,
  "genel_toplam": 3000.60
}
"""

# --- Yardımcı Fonksiyonlar ---
# (_configure_gemini, _upload_file_to_gemini, _parse_gemini_response fonksiyonları önceki mesajdaki gibi aynı kalır)
def _configure_gemini():
    """API anahtarını yükler ve Gemini kütüphanesini yapılandırır."""
    try:
        api_key = current_app.config.get('GOOGLE_API_KEY')
        if not api_key:
            print("--- HATA (Gemini Configure): GOOGLE_API_KEY bulunamadı!")
            raise ValueError("Google API Anahtarı yapılandırmada eksik.")
        genai.configure(api_key=api_key)
        print(f"--- Gemini Configure: API Anahtarı ile yapılandırma başarılı.")
        return True
    except Exception as e:
        print(f"--- HATA (Gemini Configure): Yapılandırma sırasında hata: {e}")
        return False

def _upload_file_to_gemini(filepath):
    """Verilen dosya yolundaki dosyayı Gemini Media API'ye yükler."""
    print(f"--- Gemini Upload: Dosya yükleniyor: {filepath}")
    try:
        # Dosyanın varlığını kontrol et
        if not os.path.exists(filepath):
            print(f"--- HATA (Gemini Upload): Dosya bulunamadı: {filepath}")
            return None

        # Dosyayı yükle
        uploaded_file = genai.upload_file(path=filepath)

        # Yükleme sonucunu kontrol et (SDK bazen hata vermeden None dönebilir)
        if uploaded_file is None:
             print(f"--- HATA (Gemini Upload): SDK dosyayı yükleyemedi veya None döndü: {filepath}")
             return None

        print(f"--- Gemini Upload: Dosya başarıyla yüklendi: {uploaded_file.name} ({uploaded_file.uri})")
        return uploaded_file
    except Exception as e:
        print(f"--- HATA (Gemini Upload): Dosya yüklenirken istisna oluştu: {e}")
        traceback.print_exc() # Hatanın detayını yazdır
        return None

def _parse_gemini_response(response):
    """Gemini API'den gelen yanıtı kontrol eder ve JSON'u ayrıştırır."""
    print("--- Gemini Parse: Yanıt ayrıştırılıyor...")
    error_msg_prefix = "--- HATA (Gemini Parse):" # Hata mesajı ön eki

    # 1. Yanıt var mı kontrolü
    if not response:
        print(f"{error_msg_prefix} API'den yanıt alınamadı (response objesi boş).")
        return None, "API'den yanıt alınamadı."

    # 2. Metin içeriği var mı ve JSON'a çevrilebilir mi KONTROLÜ (Engellenme kontrolünden önce!)
    raw_text = None
    try:
        # Önce candidates listesini kontrol et (daha yeni yapı)
        if response.candidates and hasattr(response.candidates[0].content, 'parts') and response.candidates[0].content.parts:
             raw_text = response.candidates[0].content.parts[0].text
        # Yoksa doğrudan .text özelliğini dene (eski yapı)
        elif hasattr(response, 'text'):
             raw_text = response.text

        if raw_text and raw_text.strip():
            print(f"--- Gemini Raw Text (Before Clean):\n{raw_text}\n---")
            cleaned_text = raw_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            print(f"--- Gemini Cleaned Text (For JSON Parse):\n{cleaned_text}\n---")

            try:
                extracted_data = json.loads(cleaned_text)
                print("--- Gemini Parse: JSON başarıyla ayrıştırıldı.")
                # JSON başarılı ise engellenme durumuna bakmadan veriyi döndür!
                # Model bazen veriyi üretip yine de bir güvenlik flag'i verebilir.
                return extracted_data, None # Başarılı: veri ve None (hata yok)
            except json.JSONDecodeError as json_e:
                error_msg = f"JSON ayrıştırma hatası: {json_e}. Satır: {json_e.lineno}, Sütun: {json_e.colno}"
                print(f"{error_msg_prefix} {error_msg}")
                print(f"{error_msg_prefix} JSON'a çevrilemeyen metin:\n{cleaned_text}")
                # JSON parse edilemezse, belki engellenmiştir, aşağıda kontrol edilecek.
        else:
             print(f"{error_msg_prefix} API yanıt metni boş veya bulunamadı.")
             # Metin yoksa, engellenme nedenini kontrol et.

    except Exception as e:
        error_msg = f"Yanıt metni işlenirken beklenmedik bir hata oluştu: {e}"
        print(f"{error_msg_prefix} {error_msg}")
        traceback.print_exc()
        # Metin işlenemezse, engellenme nedenini kontrol et.

    # 3. Engellenme Kontrolü (Eğer yukarıda JSON parse edilemediyse veya metin boşsa buraya düşer)
    finish_reason_str = "Bilinmiyor"
    safety_ratings_str = "Bilinmiyor"
    try:
        if response.candidates:
             candidate = response.candidates[0]
             finish_reason = getattr(candidate, 'finish_reason', None)
             # Gelen finish_reason'ı string'e çevirerek karşılaştıralım
             finish_reason_str = str(finish_reason) if finish_reason is not None else "None"
             safety_ratings = getattr(candidate, 'safety_ratings', [])
             safety_ratings_str = str(safety_ratings)

             print(f"--- Gemini Parse: Finish Reason = {finish_reason_str}") # Loglama

             # Eğer finish_reason "STOP" değilse (veya '1' gibi garip bir değerse) bunu logla
             if finish_reason_str != 'STOP':
                  final_error_msg = f"İçerik engellendi veya tamamlanamadı. Neden: {finish_reason_str}, Güvenlik: {safety_ratings_str}"
                  print(f"{error_msg_prefix} {final_error_msg}")
                  return None, final_error_msg
        # Fallback for prompt_feedback (if needed)
        elif hasattr(response, 'prompt_feedback') and response.prompt_feedback.block_reason:
              final_error_msg = f"İçerik engellendi (prompt_feedback). Neden: {response.prompt_feedback.block_reason}"
              print(f"{error_msg_prefix} {final_error_msg}")
              return None, final_error_msg

    except (AttributeError, IndexError, TypeError) as e:
         print(f"--- UYARI (Gemini Parse): Engellenme durumu kontrol edilirken hata: {e}. Yanıt yapısı beklenenden farklı olabilir.")

    # Eğer buraya kadar geldiyse ve JSON parse edilemediyse genel bir hata dönelim
    default_error = "Veri çıkarılamadı (JSON ayrıştırılamadı veya yanıt metni boş/hatalı)."
    print(f"{error_msg_prefix} {default_error}")
    return None, default_error


# --- Ana Fonksiyon ---

def process_with_gemini(filepath, file_type):
    """
    Verilen PDF veya Resim dosyasını Gemini API kullanarak işler ve
    çıkarılan fatura verilerini bir dictionary olarak döndürür.
    Başarısız olursa None döner.
    """
    print(f"--- Gemini Process START: Dosya: {os.path.basename(filepath)}, Tip: {file_type}")
    extracted_data = None
    error_reason = "Bilinmeyen Hata" # Başlangıç değeri

    try:
        # 1. Gemini'yi Yapılandır
        if not _configure_gemini():
            error_reason = "API yapılandırma hatası."
            return None # Yapılandırma başarısızsa devam etme

        # 2. Dosyayı Gemini'ye Yükle
        uploaded_file = _upload_file_to_gemini(filepath)
        if not uploaded_file:
            error_reason = "Dosya yükleme hatası."
            return None # Dosya yüklenemezse devam etme

        # 3. Gemini Modelini Oluştur
        print(f"--- Gemini Process: Model oluşturuluyor: {GEMINI_MODEL_NAME}")
        # Doğru model adını kullandığınızdan emin olun!
        model = genai.GenerativeModel(GEMINI_MODEL_NAME)

        # 4. API İsteğini Gönder
        print(f"--- Gemini Process: API'ye istek gönderiliyor ('{uploaded_file.name}' ile)...")
        try:
            response = model.generate_content(
                [EXTRACTION_PROMPT, uploaded_file],
                generation_config=genai.types.GenerationConfig(
                    # JSON çıktısı için response_mime_type belirlemek daha güvenilir olabilir
                    # ANCAK BU ÖZELLİK HENÜZ TÜM MODELLERDE DESTEKLENMEYEBİLİR!
                    # response_mime_type="application/json",
                    temperature=0.1 # Daha tutarlı çıktılar için düşük sıcaklık
                 )
            )
            print(f"--- Gemini Process: API'den yanıt alındı.")
        except Exception as api_e:
            error_reason = f"Gemini API çağrısı sırasında hata: {api_e}"
            print(f"--- HATA (Gemini Process - API Call): {error_reason}")
            # API hatası yanıtını yazdırmak faydalı olabilir
            if hasattr(api_e, 'response'): print(f"--- API Error Response: {api_e.response}")
            traceback.print_exc()
            return None # API hatası olursa devam etme

        # 5. Yanıtı Ayrıştır ve Veriyi Çıkar
        extracted_data, error_reason = _parse_gemini_response(response)
        if extracted_data:
             print(f"--- Gemini Process SUCCESS: Veri başarıyla çıkarıldı.")
        else:
             print(f"--- Gemini Process FAILED: Veri çıkarılamadı. Neden: {error_reason}")
             # extracted_data zaten None olacak

    except Exception as e:
        error_reason = f"Gemini işleme sırasında genel bir istisna oluştu: {e}"
        print(f"--- HATA (Gemini Process - Genel): {error_reason}")
        traceback.print_exc()
        extracted_data = None # Hata durumunda None döndüğünden emin ol

    finally:
        # Yüklenen dosyayı silme... (önceki gibi)
        pass

    print(f"--- Gemini Process END: Sonuç: {'Başarılı' if extracted_data else 'Başarısız'}, Neden: {error_reason if not extracted_data else 'Yok'}")
    return extracted_data