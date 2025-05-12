from lxml import etree # lxml kütüphanesini kullanalım (pip install lxml)
import os

# UBL-TR için yaygın kullanılan namespace'ler
# Bunlar fatura XML'inin başında tanımlanır ve değişebilir,
# Bu yüzden dinamik olarak almak veya wildcard kullanmak daha iyi olabilir.
# Şimdilik statik tanımlayalım, gerekirse geliştiririz.
NS_MAP = {
    'cac': "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    'cbc': "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    # Diğer olası namespace'ler eklenebilir (ext, sig, etc.)
}

def find_value(element, xpath_query):
    """Verilen XPath sorgusu ile değeri bulur, yoksa None döner."""
    try:
        # Birden fazla sonuç dönebilecek sorgular için ilkini alalım
        result = element.xpath(xpath_query, namespaces=NS_MAP)
        if result:
            # Eğer sonuç bir element ise text içeriğini, değilse doğrudan sonucu al
            return result[0].text if hasattr(result[0], 'text') else result[0]
        return None
    except Exception as e:
        print(f"XPath hatası: {xpath_query}, Hata: {e}")
        return None

def parse_ubl_xml(xml_filepath):
    """Bir UBL-TR XML faturasını ayrıştırır ve temel bilgileri dict olarak döner."""
    try:
        tree = etree.parse(xml_filepath)
        root = tree.getroot()

        data = {}

        # Temel Fatura Bilgileri
        data['fatura_no'] = find_value(root, './cbc:ID/text()')
        data['tarih'] = find_value(root, './cbc:IssueDate/text()') # YYYY-AA-GG formatında gelir genelde
        # Tarihi GG.AA.YYYY formatına çevirebiliriz
        if data['tarih']:
             try:
                 from datetime import datetime
                 dt_obj = datetime.strptime(data['tarih'], '%Y-%m-%d')
                 data['tarih'] = dt_obj.strftime('%d.%m.%Y')
             except ValueError:
                 print(f"XML Tarih formatı beklenenden farklı: {data['tarih']}")
                 # Ham veriyi bırakabilir veya hata verebiliriz

        # Satıcı Bilgileri (AccountingSupplierParty)
        supplier_party = root.find('.//cac:AccountingSupplierParty/cac:Party', namespaces=NS_MAP)
        if supplier_party is not None:
            data['satici_vkn_tckn'] = find_value(supplier_party, './cac:PartyIdentification[cbc:ID/@schemeID="VKN"]/cbc:ID/text()') or \
                                     find_value(supplier_party, './cac:PartyIdentification[cbc:ID/@schemeID="TCKN"]/cbc:ID/text()')
            data['firma_unvan'] = find_value(supplier_party, './cac:PartyName/cbc:Name/text()') or \
                                  find_value(supplier_party, './cac:Person/cbc:FirstName/text()') # Şahıs firması olabilir

        # Müşteri Bilgileri (AccountingCustomerParty) - Opsiyonel, bazen gerekli olmayabilir
        customer_party = root.find('.//cac:AccountingCustomerParty/cac:Party', namespaces=NS_MAP)
        if customer_party is not None:
             data['alici_vkn_tckn'] = find_value(customer_party, './cac:PartyIdentification[cbc:ID/@schemeID="VKN"]/cbc:ID/text()') or \
                                      find_value(customer_party, './cac:PartyIdentification[cbc:ID/@schemeID="TCKN"]/cbc:ID/text()')
             data['alici_firma_unvan'] = find_value(customer_party, './cac:PartyName/cbc:Name/text()') # Ekleme


        # Toplamlar (LegalMonetaryTotal)
        monetary_total = root.find('.//cac:LegalMonetaryTotal', namespaces=NS_MAP)
        if monetary_total is not None:
            data['matrah'] = find_value(monetary_total, './cbc:LineExtensionAmount/text()') # Vergisiz Toplam (Genellikle KDV Matrahıdır)
            data['genel_toplam'] = find_value(monetary_total, './cbc:PayableAmount/text()') # Ödenecek Tutar

        # Vergiler (TaxTotal) - Birden fazla KDV oranı olabilir
        tax_total_elements = root.findall('.//cac:TaxTotal', namespaces=NS_MAP)
        kdv_details = []
        total_kdv_amount = 0.0
        primary_kdv_rate = None # İlk bulunan oranı alalım şimdilik

        for tax_total in tax_total_elements:
            tax_amount_str = find_value(tax_total, './cbc:TaxAmount/text()')
            if tax_amount_str:
                try:
                    tax_amount = float(tax_amount_str)
                    total_kdv_amount += tax_amount

                    # Alt kırılımları (TaxSubtotal) bul
                    for subtotal in tax_total.findall('.//cac:TaxSubtotal', namespaces=NS_MAP):
                        percent_str = find_value(subtotal, './/cac:TaxCategory/cbc:Percent/text()')
                        taxable_amount_str = find_value(subtotal, './cbc:TaxableAmount/text()') # Matrah (Bu vergi oranı için)
                        sub_tax_amount_str = find_value(subtotal, './cbc:TaxAmount/text()') # Tutar (Bu vergi oranı için)

                        detail = {
                            'oran': float(percent_str) if percent_str else None,
                            'matrah': float(taxable_amount_str) if taxable_amount_str else None,
                            'tutar': float(sub_tax_amount_str) if sub_tax_amount_str else None
                        }
                        kdv_details.append(detail)
                        if primary_kdv_rate is None and detail['oran'] is not None:
                            primary_kdv_rate = detail['oran']

                except (ValueError, TypeError) as e:
                    print(f"Vergi tutarı/oranı dönüştürme hatası: {e}")


        data['kdv_tutari'] = str(total_kdv_amount) # Toplam KDV tutarı
        data['kdv_orani'] = str(primary_kdv_rate) if primary_kdv_rate is not None else None # Şimdilik ilk bulunan oran
        data['kdv_detaylari'] = kdv_details # Tüm KDV kırılımları

        # Sayısal değerleri float'a çevirmeyi deneyelim (opsiyonel, doğrulama adımında da yapılabilir)
        for key in ['matrah', 'genel_toplam', 'kdv_tutari']:
             if data.get(key):
                 try:
                     data[key] = float(data[key])
                 except (ValueError, TypeError):
                      print(f"XML'den gelen '{key}' değeri sayıya çevrilemedi: {data[key]}")
                      data[key] = None # Veya ham string bırakılabilir

        # Eksik anahtar alanları kontrol et (en azından fatura no, tarih, toplam olmalı)
        if not all(data.get(k) for k in ['fatura_no', 'tarih', 'genel_toplam']):
             print("XML'den temel fatura bilgileri (No, Tarih, Toplam) çıkarılamadı.")
             return None # Veya kısmi veriyi döndür

        return data

    except etree.XMLSyntaxError as e:
        print(f"XML dosyası bozuk veya hatalı: {xml_filepath}, Hata: {e}")
        return None
    except Exception as e:
        print(f"XML ayrıştırılırken beklenmedik hata: {xml_filepath}, Hata: {e}")
        return None