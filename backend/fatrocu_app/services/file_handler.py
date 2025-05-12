import os
from werkzeug.utils import secure_filename
import mimetypes
from flask import current_app
import json

# Eğer python-magic ile sorun yaşarsanız (özellikle Windows'ta DLL gerekebilir),
# sadece dosya uzantısına göre de kontrol yapabilirsiniz.
# import mimetypes

# XML ayrıştırma, Gemini işleme ve doğrulama fonksiyonlarını import edeceğiz
from .xml_parser import parse_ubl_xml
from .gemini_processor import process_with_gemini
from .data_validator import validate_invoice_data

# Sonuçları saklamak için basit bir yöntem (JSON dosyası olarak)
def save_result(filename, data):
    """İşlenmiş veriyi uploads klasörüne JSON olarak kaydeder."""
    try:
        base_filename = os.path.splitext(filename)[0]
        json_filename = f"{base_filename}.json"
        json_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], json_filename)
        with open(json_filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Sonuçlar kaydedildi: {json_filepath}")
        return json_filename
    except Exception as e:
        print(f"Sonuçlar kaydedilirken hata: {e}")
        return None

def load_result(filename):
    """Kaydedilmiş JSON sonucunu yükler."""
    try:
        base_filename = os.path.splitext(filename)[0]
        json_filename = f"{base_filename}.json"
        json_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], json_filename)
        if os.path.exists(json_filepath):
            with open(json_filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data
        else:
            return None
    except Exception as e:
        print(f"Sonuçlar yüklenirken hata: {e}")
        return None


def get_file_type(filepath):
    """Dosya tipini belirler (XML, PDF, Image) - mimetypes kullanarak."""
    try:
        # mimetypes ile tahmin et
        mime_type, _ = mimetypes.guess_type(filepath)
        print(f"Tahmin edilen MIME tipi (mimetypes): {mime_type}") # Logu değiştirildi

        if mime_type:
            if 'xml' in mime_type:
                return 'xml'
            elif 'pdf' in mime_type:
                return 'pdf'
            elif mime_type.startswith('image/'):
                return 'image'
            else:
                 print(f"Desteklenmeyen MIME tipi: {mime_type}. Uzantıya bakılıyor.")
                 ext = os.path.splitext(filepath)[1].lower()
                 if ext == '.xml': return 'xml'
                 if ext == '.pdf': return 'pdf'
                 if ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.heic']: return 'image'
                 return 'unsupported'
        else:
             print("MIME tipi tahmin edilemedi, sadece uzantıya bakılıyor.")
             ext = os.path.splitext(filepath)[1].lower()
             if ext == '.xml': return 'xml'
             if ext == '.pdf': return 'pdf'
             if ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.heic']: return 'image'
             return 'unsupported'

    except Exception as e:
        print(f"Dosya tipi belirlenirken hata: {e}")
        return 'error'

def process_invoice(filepath):
    """Ana fatura işleme fonksiyonu."""
    filename = os.path.basename(filepath)
    print(f"'{filename}' işleniyor...")
    extracted_data = None
    processing_status = "failed"
    error_message = None
    source_type = "unknown"

    file_type = get_file_type(filepath)
    source_type = file_type # İşlem başarılı olursa bu tip kaydedilir

    try:
        if file_type == 'xml':
            print("XML dosyası tespit edildi, ayrıştırılıyor...")
            extracted_data = parse_ubl_xml(filepath)
            if not extracted_data:
                error_message = "XML ayrıştırılamadı veya gerekli bilgiler bulunamadı."

        elif file_type in ['pdf', 'image']:
            print(f"{file_type.upper()} dosyası tespit edildi, Gemini ile işleniyor...")
            extracted_data = process_with_gemini(filepath, file_type)
            if not extracted_data:
                 error_message = "Gemini API ile işlenemedi veya veri çıkarılamadı."

        else:
            error_message = f"Desteklenmeyen dosya tipi: {file_type}"
            source_type = "unsupported"


        # Veri başarıyla çıkarıldıysa doğrula
        if extracted_data:
            print("Veri çıkarıldı, doğrulama yapılıyor...")
            validated_data = validate_invoice_data(extracted_data)
            processing_status = "completed" # Doğrulama sonrası tamamlandı sayalım
            print("İşlem tamamlandı.")
            final_data = {
                "status": processing_status,
                "source_type": source_type,
                "filename": filename,
                "extracted_data": validated_data, # Doğrulanmış veri
                "error": None
            }
        else:
             final_data = {
                "status": processing_status,
                "source_type": source_type,
                "filename": filename,
                "extracted_data": None,
                "error": error_message
             }

        # Sonucu JSON olarak kaydet
        save_result(filename, final_data)
        return final_data

    except Exception as e:
        print(f"'{filename}' işlenirken beklenmedik hata: {e}")
        error_result = {
            "status": "error",
            "source_type": source_type,
            "filename": filename,
            "extracted_data": None,
            "error": f"İşlem sırasında genel bir hata oluştu: {str(e)}"
        }
        save_result(filename, error_result) # Hata durumunu da kaydedelim
        return error_result