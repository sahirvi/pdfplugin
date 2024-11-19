# Automatisierte Rechnungserstellung für Wix

### Projektbeschreibung
Dieses Projekt wurde gemeinsam mit **Albert Kaminski** entwickelt, um die Einschränkungen der Wix-Plattform zu umgehen, die keine automatisierte Rechnungserstellung bietet. Es handelt sich um einen Service, der Rechnungsdaten von Kunden über eine REST-API empfängt, diese verarbeitet und automatisch eine eigene Rechnung erstellt. Die Rechnung wird im PDF-Format generiert und anschließend per E-Mail an den Käufer gesendet.

### Features
- **API-Integration:** Empfang von Bestelldaten im JSON-Format.
- **PDF-Erstellung:** Nutzung von `jspdf`, um anpassbare Rechnungen zu erstellen.
- **E-Mail-Versand:** Senden der Rechnungen über `nodemailer`.
- **Technologien:**
  - **Node.js:** Zur Entwicklung des Servers.
  - **Express:** Als Framework für die API-Routen.
  - **Axios:** Für externe API-Aufrufe.
  - **JSPDF:** Zur PDF-Erstellung.
  - **Nodemailer:** Für den E-Mail-Versand.

Dieses Projekt wurde als eigenständige Lösung entwickelt, um die Automatisierung von Rechnungsprozessen zu erleichtern.

---

### English

# Automated Invoice Generation for Wix

### Project Description
This project was developed together with **Albert Kaminski** to overcome the limitations of the Wix platform, which does not provide automated invoice generation. It is a service that receives invoice data from customers via a REST API, processes the data, and automatically generates a custom invoice. The invoice is created as a PDF file and sent to the buyer via email.

### Features
- **API Integration:** Receives order data in JSON format.
- **PDF Generation:** Uses `jspdf` to create customizable invoices.
- **Email Sending:** Sends invoices via `nodemailer`.
- **Technologies:**
  - **Node.js:** For server development.
  - **Express:** As a framework for API routes.
  - **Axios:** For external API calls.
  - **JSPDF:** For PDF generation.
  - **Nodemailer:** For email delivery.

This project was designed as a standalone solution to efficiently automate invoice workflows.
