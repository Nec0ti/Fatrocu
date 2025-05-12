# backend/fatrocu_app/routes.py
from flask import Blueprint, jsonify, request, render_template, send_from_directory, current_app
from werkzeug.utils import secure_filename
import os
import pandas as pd # Excel için (mock data içinde kullanılıyorsa)

# API endpointleri için bir Blueprint oluştur
# url_prefix='/api' sayesinde tüm bu blueprint'teki routelar /api ile başlayacak
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Örnek bir API endpoint'i
@api_bp.route('/hello')
def hello():
    return jsonify(message="Backend'den Merhaba!")

# ---- DOSYA YÜKLEME ENDPOINT'İ ----
@api_bp.route('/upload', methods=['POST'])
def upload_file():
    # current_app üzerinden uygulama yapılandırmasına eriş
    app_config = current_app.config

    # Klasörlerin varlığını kontrol et (burada veya __init__.py'de yapılabilir)
    if not os.path.exists(app_config['UPLOAD_FOLDER']):
        os.makedirs(app_config['UPLOAD_FOLDER'])

    if 'file' not in request.files:
        return jsonify(error="Dosya bulunamadı"), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(error="Dosya seçilmedi"), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app_config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            print(f"Dosya kaydedildi: {filepath}")
            # TODO: İşleme servisini çağır
            return jsonify(message=f"'{filename}' başarıyla yüklendi.", filename=filename), 200
        except Exception as e:
            print(f"Dosya kaydedilirken hata: {e}")
            return jsonify(error=f"Dosya kaydedilemedi: {e}"), 500
    return jsonify(error="Geçersiz dosya"), 400

# ---- SONUÇLARI ALMA ENDPOINT'İ (TASLAK) ----
# Dikkat: filename parametresi route'a eklenmeli
@api_bp.route('/results/<filename>', methods=['GET'])
def get_results(filename):
    # TODO: filename'e ait işlenmiş veriyi bulup döndür
    mock_data = {
        "fatura_no": "ABC123456", "tarih": "15.07.2024", "vkn_tckn": "1112223334",
        "firma_unvan": "Örnek Teknoloji A.Ş.", "matrah": 1000.00, "kdv_orani": 20,
        "kdv_tutari": 200.00, "toplam": 1200.00, "status": "completed",
        "source_type": "pdf_image"
    }
    return jsonify(data=mock_data), 200

# ---- EXCEL İNDİRME ENDPOINT'İ (TASLAK) ----
# Dikkat: filename parametresi route'a eklenmeli
@api_bp.route('/export/<filename>', methods=['GET'])
def export_excel(filename):
    app_config = current_app.config

     # Klasörlerin varlığını kontrol et
    if not os.path.exists(app_config['OUTPUT_FOLDER']):
        os.makedirs(app_config['OUTPUT_FOLDER'])

    excel_filename = f"{os.path.splitext(filename)[0]}.xlsx"
    excel_filepath = os.path.join(app_config['OUTPUT_FOLDER'], excel_filename)

    # ---- SAHTE EXCEL OLUŞTURMA ----
    try:
        mock_data = {
            "Fatura No": ["ABC123456"], "Tarih": ["15.07.2024"], "VKN/TCKN": ["1112223334"],
            "Firma Ünvanı": ["Örnek Teknoloji A.Ş."], "Matrah": [1000.00], "KDV Oranı (%)": [20],
            "KDV Tutarı": [200.00], "Toplam Tutar": [1200.00]
        }
        df = pd.DataFrame(mock_data)
        # openpyxl engine'i genellikle .xlsx için gereklidir
        df.to_excel(excel_filepath, index=False, engine='openpyxl')
        print(f"Excel oluşturuldu: {excel_filepath}")
    except Exception as e:
        print(f"Excel oluşturulurken hata: {e}")
        return jsonify(error=f"Excel dosyası oluşturulamadı: {e}"), 500
    # ---- SAHTE EXCEL BİTTİ ----

    try:
        # send_from_directory kullanırken dosya adını verin, tam yolu değil
        return send_from_directory(app_config['OUTPUT_FOLDER'], excel_filename, as_attachment=True)
    except FileNotFoundError:
         print(f"Excel dosyası bulunamadı: {excel_filepath}")
         return jsonify(error="Oluşturulan Excel dosyası bulunamadı."), 404