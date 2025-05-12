# Fatrocu: AI-Powered Invoice Data Extraction

**Effortlessly convert invoice images and PDFs into structured Excel data.**

---

## Overview

Fatrocu streamlines your accounting workflow by automating the tedious task of manual data entry from invoices. Leveraging the power of Google's Gemini AI, Fatrocu intelligently analyzes invoice documents (PDFs and images), extracts key information, and allows you to export it directly into an Excel spreadsheet.

Simply drag and drop your invoice files, and let Fatrocu handle the rest – from capturing the invoice number and date to identifying VAT amounts and categorizing income/expenses.

## Key Features

*   **Multi-Format Support:** Analyzes invoices provided as PDF, PNG, or JPG files.
*   **Intelligent Data Extraction:** Automatically identifies and extracts crucial details:
    *   Invoice Number
    *   Invoice Date
    *   Supplier/Customer Information (Basic)
    *   Total Amount
    *   VAT Amount & Rate
    *   And more...
*   **Income/Expense Categorization:** Helps differentiate between incoming and outgoing transactions.
*   **Excel Export:** Easily save all extracted data in a well-structured `.xlsx` file for further analysis or import into accounting software.
*   **Simple Drag-and-Drop Interface:** User-friendly design requires no technical expertise.
*   **AI-Powered Accuracy:** Utilizes Google's advanced Gemini AI models for reliable data recognition.
*   **Cross-Platform Access:** Available as a downloadable Windows application and a web-based version.
*   **Multilingual Potential:** Includes support for processing invoices in different languages (e.g., English, Turkish).

## How It Works

1.  **Upload:** Drag and drop your invoice file(s) (PDF, PNG, JPG) onto the Fatrocu interface.
2.  **AI Analysis:** Fatrocu securely sends the invoice data to the Google Gemini API for processing. The AI identifies and extracts relevant fields.
3.  **Review & Export:** The extracted information is presented within the application. You can review the results and export them as an Excel file with a single click.

## Requirements

*   **Google Gemini API Key:** Fatrocu uses Google's Gemini AI for its core data extraction capabilities. You need an API key to use the service.
    *   You can obtain a **free** API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   The free tier is generally sufficient for moderate usage.

## Installation and Usage

### Windows Application

1.  Navigate to the [**Releases**](https://github.com/Nec0ti/Fatrocu/releases) page on GitHub.
2.  Download the `fatrocu_win-32-x64.zip` (or similar) archive.
3.  Extract the contents of the downloaded `.zip` file to a location on your computer (e.g., your Desktop).
4.  Open the extracted folder (e.g., `Fatrocu-win32-x64`).
5.  Double-click the `Fatrocu.exe` file to launch the application.
6.  Upon first launch, click the **'Settings'** button (usually top-right).
7.  Enter your **Google Gemini API Key** in the designated field and save.
8.  Return to the main screen and start processing your invoices by dragging and dropping files.

### Web Browser Version

1.  Open your web browser and go to: [**https://nec0ti.github.io/Fatrocu**](https://nec0ti.github.io/Fatrocu)
2.  Click the **'Settings'** button (usually top-right).
3.  Enter your **Google Gemini API Key** in the designated field and save.
4.  Return to the main page and begin using the application by dragging and dropping your invoice files.

## Roadmap / Future Enhancements

*   [ ] **Intermediate JSON Step:** Convert input files (PDF, PNG, etc.) to a structured JSON format first, then extract data from JSON. (Potential for higher accuracy and easier field mapping).
*   [x] PDF/PNG/JPG analysis feature.
*   [x] Income/Expense separation feature.
*   [x] More language support (e.g., English).
*   [ ] **Improved Fiscal Receipt Accuracy:** Enhance analysis specifically for Fiscal Device Receipts (ÖKC / Cash Register / POS receipts).
*   [ ] **Model Fine-Tuning:** Explore fine-tuning the AI model for better performance on specific invoice layouts or types.
*   [ ] **Extended Data Extraction:** Add capabilities to extract additional fields like line items, phone numbers, bank details, etc.
*   [ ] **Wider Platform Support:** Develop native versions for Linux and macOS.
*   [x] **Batch Processing:** Allow users to upload and process multiple invoices simultaneously.
*   [ ] **User Configuration:** Allow users to specify or map custom fields they want to extract.

## Contributing

Contributions are welcome! If you'd like to help improve Fatrocu, please feel free to fork the repository, make changes, and submit a pull request. You can also open an issue to report bugs or suggest new features.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

*Speed up your invoice processing with Fatrocu!*
