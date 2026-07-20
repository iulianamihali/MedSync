# 🏥 MedSync

> Platformă web pentru gestionarea centralizată a mai multor clinici medicale

MedSync oferă clinicilor un sistem integrat de administrare a activității zilnice și pacienților un istoric medical unificat, accesibil și ușor de partajat între instituții.

---

## 🛠️ Tehnologii utilizate

| Strat | Tehnologie |
|---|---|
| Frontend | React, TypeScript |
| Backend | C#, .NET 8 (Web API + Worker Service) |
| Bază de date | Microsoft SQL Server |
| Email | MailerSend |
| Asistent AI | Google Gemini |

---

## 🏗️ Arhitectura serviciilor

![Arhitectura serviciilor](public/ss_readme/arhitectura_servicii.png)

---

## 🗃️ Arhitectura bazei de date

![Arhitectura bazei de date](public/ss_readme/arhitectura_db.png)

---

## 👥 Roluri și funcționalități

![Roluri și funcționalități](public/ss_readme/roluri_si_functionalitati.png)

---

## ⚙️ Cerințe preliminare

- [Node.js](https://nodejs.org/) v18+
- [.NET SDK](https://dotnet.microsoft.com/download) v8+
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server)

---

## 🚀 Rulare locală

### Backend

Configurează `appsettings.Development.json` în folderul `MedSync/`:

```json
{
  "ConnectionStrings": {
    "MedSyncDb": "Server=localhost\\SQLEXPRESS;Database=MedSync;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "MailerSend": {
    "ApiKey": "your_mailersend_api_key"
  },
  "Gemini": {
    "ApiKey": "your_gemini_api_key"
  },
  "MapBoxToken": {
    "AccessToken": "your_mapbox_token"
  }
}
```

```powershell
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend

Configurează `.env` în rădăcina proiectului:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

```powershell
npm install
npm run dev
```
