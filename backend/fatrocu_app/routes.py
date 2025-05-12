# backend/fatrocu_app/routes.py
from flask import Blueprint, jsonify, request, send_from_directory, current_app
from werkzeug.utils import secure_filename
import os
import pandas as pd

# Servis fonksiyonlarını import et
from .services.file_handler import process_invoice, load_result, save_result # save_result eklendi
from .services.excel_exporter import create_excel # Ayrı bir excel modülü oluşturalım

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Örnek endpoint (değişiklik yok)
@api_bp.route('/hello')
def hello():
    return jsonify(message="Backend'den Merhaba!")

# ---- DOSYA YÜKLEME & İŞLEME ENDPOINT'İ ----
@api_bp.route('/upload', methods=['POST'])
def upload_file():
    app_config = current_app.config
    upload_folder = app_config['UPLOAD_FOLDER']

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    if 'file' not in request.files:
        return jsonify(error="Dosya bulunamadı"), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(error="Dosya seçilmedi"), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(upload_folder, filename)
        try:
            file.save(filepath)
            print(f"Dosya kaydedildi: {filepath}")

            # ------ FATURA İŞLEME ------
            # file_handler'daki ana işleme fonksiyonunu çağır
            processing_result = process_invoice(filepath)
            # --------------------------

            # İşleme sonucunu (başarılı veya hatalı) doğrudan döndür
            if processing_result.get("status") == "error" or processing_result.get("status") == "failed":
                 # Belki hata durumunda farklı HTTP kodu dönebiliriz? 500 Internal Server Error gibi?
                 # Şimdilik 200 OK ile birlikte hatayı JSON içinde dönelim.
                 print(f"İşleme başarısız/hatalı: {filename}")
                 # return jsonify(processing_result), 500
            else:
                 print(f"İşleme başarılı: {filename}")

            return jsonify(processing_result), 200 # Başarı veya hata JSON'ı döndür

        except Exception as e:
            # Dosya kaydetme veya process_invoice çağrısı sırasında genel hata
            print(f"Dosya yükleme/işleme sırasında genel hata: {e}")
            # Hata durumunu da JSON olarak kaydetmeye çalışalım
            error_data = {
                 "status": "error", "filename": filename, "extracted_data": None,
                 "error": f"Yükleme/İşleme sırasında beklenmedik sunucu hatası: {str(e)}"
            }
            save_result(filename, error_data) # Fonksiyon None dönebilir ama denemekte fayda var
            return jsonify(error_data), 500
    return jsonify(error="Geçersiz dosya"), 400

# ---- SONUÇLARI ALMA ENDPOINT'İ ----
@api_bp.route('/results/<filename>', methods=['GET'])
def get_results(filename):
    # Kaydedilmiş JSON sonucunu yükle
    result_data = load_result(secure_filename(filename)) # filename'i güvenli hale getir
    if result_data:
        return jsonify(result_data), 200
    else:
        # Henüz işlenmemiş veya bulunamayan dosya
        return jsonify(error=f"'{filename}' için sonuç bulunamadı veya henüz işlenmedi."), 404

# ---- EXCEL İNDİRME ENDPOINT'İ ----
@api_bp.route('/export/<filename>', methods=['GET'])
def export_excel_route(filename): # Fonksiyon adını route'dan ayırmak iyi pratik
    app_config = current_app.config
    output_folder = app_config['OUTPUT_FOLDER']
    safe_filename = secure_filename(filename)

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Önce işlenmiş veriyi JSON dosyasından yükle
    result_data = load_result(safe_filename)

    if not result_data or result_data.get("status") not in ["completed", "verified"]: # Sadece başarılı/doğrulanmış olanları export et
         error_msg = f"'{safe_filename}' için dışa aktarılacak onaylanmış veri bulunamadı."
         if result_data and result_data.get('error'):
              error_msg += f" Hata: {result_data.get('error')}"
         elif not result_data:
              error_msg = f"'{safe_filename}' dosyası veya işlenmiş verisi bulunamadı."
         return jsonify(error=error_msg), 404


    # Excel oluşturma işlemini ayrı bir fonksiyona taşıyalım
    excel_filepath = create_excel(result_data.get("extracted_data", {}), safe_filename, output_folder)

    if excel_filepath and os.path.exists(excel_filepath):
        try:
            # Göreceli path yerine dosya adını verelim
            excel_basename = os.path.basename(excel_filepath)
            return send_from_directory(output_folder, excel_basename, as_attachment=True)
        except FileNotFoundError:
             print(f"Oluşturulan Excel dosyası bulunamadı: {excel_filepath}")
             return jsonify(error="Oluşturulan Excel dosyası gönderilemedi."), 404
        except Exception as e:
             print(f"Excel gönderilirken hata: {e}")
             return jsonify(error=f"Excel gönderilirken sunucu hatası: {str(e)}"), 500
    else:
        return jsonify(error="Excel dosyası oluşturulamadı veya bulunamadı."), 500