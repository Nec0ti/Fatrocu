import re
from datetime import datetime
import math

def validate_date(date_str):
    """Tarihi GG.AA.YYYY formatında doğrular ve datetime nesnesi döner."""
    if not date_str or not isinstance(date_str, str):
        return None, "Tarih boş veya geçersiz tip."
    try:
        # Yaygın ayırıcıları tolere etmeye çalışalım
        cleaned_date_str = date_str.replace('-', '.').replace('/', '.')
        # Gün ve ay tek haneli ise başına 0 ekle (örn: 1.1.2024 -> 01.01.2024)
        parts = cleaned_date_str.split('.')
        if len(parts) == 3:
             parts = [p.zfill(2) for p in parts[:2]] + [parts[2]]
             cleaned_date_str = '.'.join(parts)

        dt_obj = datetime.strptime(cleaned_date_str, '%d.%m.%Y')
        return dt_obj.strftime('%d.%m.%Y'), None # Başarılı, formatlanmış string dön
    except ValueError:
        return None, f"Geçersiz tarih formatı: {date_str}. GG.AA.YYYY bekleniyor."

def validate_vkn_tckn(number_str):
    """VKN (10 hane) veya TCKN (11 hane) formatını doğrular."""
    if not number_str or not isinstance(number_str, str):
        return False, "VKN/TCKN boş veya geçersiz tip."
    cleaned_number = re.sub(r'\D', '', number_str) # Sadece rakamları al
    length = len(cleaned_number)
    if length == 10 or length == 11:
         # Burada daha gelişmiş VKN/TCKN algoritma kontrolleri eklenebilir (opsiyonel)
        return True, None
    else:
        return False, f"Geçersiz VKN/TCKN uzunluğu ({length} hane): {number_str}"

def validate_amount(amount_val):
    """Tutarı sayısal (float) olarak doğrular ve döner."""
    if amount_val is None: return None, "Tutar boş."
    try:
        # String gelirse virgülü noktaya çevir, boşlukları kaldır
        if isinstance(amount_val, str):
             cleaned_amount = amount_val.replace('.', '', amount_val.count('.') -1).replace(',', '.').strip() # Binlik ayıracını kaldır, ondalığı nokta yap
             return float(cleaned_amount), None
        elif isinstance(amount_val, (int, float)):
            return float(amount_val), None
        else:
             return None, f"Geçersiz tutar tipi: {type(amount_val)}"
    except (ValueError, TypeError):
         return None, f"Geçersiz tutar formatı: {amount_val}"


def validate_invoice_data(data):
    """AI veya XML'den çıkarılan veriyi doğrular ve notlar ekler."""
    if not data:
        return {"validation_errors": ["Doğrulanacak veri yok."]}

    validated_data = data.copy() # Orijinal veriyi bozmayalım
    errors = []
    warnings = []

    # Tarih Doğrulama
    date_val, date_err = validate_date(data.get('tarih'))
    if date_err: errors.append(f"Tarih: {date_err}")
    validated_data['tarih'] = date_val # Başarılıysa formatlanmış halini kaydet

    # VKN/TCKN Doğrulama
    satici_vkn_valid, satici_vkn_err = validate_vkn_tckn(data.get('satici_vkn_tckn'))
    if satici_vkn_err: errors.append(f"Satıcı VKN/TCKN: {satici_vkn_err}")
    if data.get('alici_vkn_tckn'): # Alıcı zorunlu değil
         alici_vkn_valid, alici_vkn_err = validate_vkn_tckn(data.get('alici_vkn_tckn'))
         if alici_vkn_err: warnings.append(f"Alıcı VKN/TCKN: {alici_vkn_err}") # Hata yerine uyarı?

    # Tutar Doğrulama
    matrah_f, matrah_err = validate_amount(data.get('kdv_matrah'))
    if matrah_err: errors.append(f"Matrah: {matrah_err}")
    validated_data['kdv_matrah'] = matrah_f

    kdv_tutari_f, kdv_tutari_err = validate_amount(data.get('kdv_tutari'))
    if kdv_tutari_err: errors.append(f"KDV Tutarı: {kdv_tutari_err}")
    validated_data['kdv_tutari'] = kdv_tutari_f

    toplam_f, toplam_err = validate_amount(data.get('genel_toplam'))
    if toplam_err: errors.append(f"Genel Toplam: {toplam_err}")
    validated_data['genel_toplam'] = toplam_f

    kdv_orani_f, _ = validate_amount(data.get('kdv_orani')) # Oran hatası kritik olmayabilir
    validated_data['kdv_orani'] = kdv_orani_f


    # Matematiksel Tutarlılık Kontrolü
    if matrah_f is not None and kdv_tutari_f is not None and toplam_f is not None:
        calculated_total = matrah_f + kdv_tutari_f
        # Kuruş farklarını tolere etmek için math.isclose kullanalım
        if not math.isclose(calculated_total, toplam_f, rel_tol=1e-2): # %1 tolerans veya abs_tol=0.02 gibi
             warnings.append(f"Matematiksel tutarsızlık: Matrah ({matrah_f:.2f}) + KDV ({kdv_tutari_f:.2f}) = {calculated_total:.2f} != Genel Toplam ({toplam_f:.2f})")

        # Oran üzerinden de kontrol (eğer oran varsa)
        if kdv_orani_f is not None and kdv_orani_f > 0 and matrah_f != 0:
             calculated_kdv = matrah_f * (kdv_orani_f / 100.0)
             if not math.isclose(calculated_kdv, kdv_tutari_f, rel_tol=1e-2):
                 warnings.append(f"KDV Tutar tutarsızlığı: Matrah*Oran ({matrah_f:.2f}*{kdv_orani_f}%) = {calculated_kdv:.2f} != KDV Tutarı ({kdv_tutari_f:.2f})")

    validated_data['validation_errors'] = errors
    validated_data['validation_warnings'] = warnings

    print(f"Doğrulama tamamlandı. Hatalar: {len(errors)}, Uyarılar: {len(warnings)}")
    return validated_data