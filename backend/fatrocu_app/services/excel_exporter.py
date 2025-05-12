import pandas as pd
import os
from flask import current_app

def create_excel(data, original_filename, output_folder):
    """Verilen data dict'inden bir Excel dosyası oluşturur."""
    if not data:
        print("Excel oluşturmak için veri yok.")
        return None

    try:
        # Excel'e yazılacak veriyi hazırla (DataFrame için uygun format)
        # Sadece 'extracted_data' içindeki anahtar alanları alalım
        excel_data = {
            "Fatura No": [data.get('fatura_no', '')],
            "Tarih": [data.get('tarih', '')],
            "Satıcı VKN/TCKN": [data.get('satici_vkn_tckn', '')],
            "Satıcı Ünvan": [data.get('firma_unvan', '')],
            "Alıcı VKN/TCKN": [data.get('alici_vkn_tckn', '')],
            "Alıcı Ünvan": [data.get('alici_firma_unvan', '')],
            "KDV Matrahı": [data.get('kdv_matrah', None)],
            "KDV Oranı (%)": [data.get('kdv_orani', None)],
            "KDV Tutarı": [data.get('kdv_tutari', None)],
            "Genel Toplam": [data.get('genel_toplam', None)],
            # Doğrulama notlarını ekleyebiliriz (opsiyonel)
            "Doğrulama Hataları": [", ".join(data.get('validation_errors', []))],
            "Doğrulama Uyarıları": [", ".join(data.get('validation_warnings', []))]
        }
        # Eğer KDV detayları varsa, ayrı satırlar/sütunlar olarak eklenebilir
        # Şimdilik ana bilgileri ekleyelim.

        df = pd.DataFrame(excel_data)

        # Çıktı dosya adı
        base_filename = os.path.splitext(original_filename)[0]
        excel_filename = f"{base_filename}.xlsx"
        excel_filepath = os.path.join(output_folder, excel_filename)

        # Excel'e yaz
        df.to_excel(excel_filepath, index=False, engine='openpyxl')

        print(f"Excel oluşturuldu: {excel_filepath}")
        return excel_filepath

    except Exception as e:
        print(f"Excel oluşturulurken hata: {e}")
        return None