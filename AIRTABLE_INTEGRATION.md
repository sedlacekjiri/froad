# 🗺️ Airtable Integration for Froad

## Overview

This integration allows you to manage **huts**, **campsites**, and **F-roads** data via Airtable instead of hardcoding them in JavaScript files.

### ✅ Why Airtable?

- **Easy editing**: Spreadsheet-like interface
- **No coding required**: Update data without touching code
- **Team collaboration**: Share editing access with others
- **Automatic caching**: 24-hour cache reduces API costs
- **Free tier friendly**: 1000 calls/month usually sufficient

---

## 📁 Files Added

```
froad/
├── airtable-config.js       # Airtable API wrapper & config
├── huts-data.csv            # Existing huts data for import
├── AIRTABLE_SETUP.md        # Detailed setup guide
└── AIRTABLE_INTEGRATION.md  # This file
```

### Modified Files

- `explore.html` - Added Airtable script reference and async huts loading

---

## 🚀 Quick Start

### 1. Create Airtable Base

1. Sign up at https://airtable.com
2. Create a base named "Froad Data"
3. Create a table named "Huts" with these fields:
   - `Name` (Single line text)
   - `Latitude` (Number)
   - `Longitude` (Number)
   - `Link` (URL)
   - `Photo` (URL)
   - `Description` (Long text)
   - `Status` (Single select: "Active" or "Hidden")

### 2. Import Data

- Import `huts-data.csv` into your Airtable "Huts" table
- Or manually copy the 19 existing huts

### 3. Get API Credentials

- **Base ID**: From https://airtable.com/api (looks like `appXXXXXXXXXXXXXX`)
- **API Token**: Create at https://airtable.com/create/tokens
  - Scope: `data.records:read`
  - Add access to your base

### 4. Configure

Edit `airtable-config.js`:

```javascript
const AIRTABLE_CONFIG = {
  BASE_ID: 'appXXXXXXXXXXXXXX',  // Your Base ID
  API_KEY: 'patXXXXXXXXXXXXXX.XXXXXX...',  // Your API Token
  // ...
};
```

### 5. Test

Open `explore.html` and check browser console for:

```
📡 Loading huts from Airtable...
✅ Rendered 19 huts on map
```

---

## 📖 Full Documentation

See **[AIRTABLE_SETUP.md](./AIRTABLE_SETUP.md)** for:
- Detailed step-by-step setup
- Troubleshooting guide
- API usage optimization
- Security best practices

---

## 🔧 Usage

### Update Huts

1. Go to your Airtable base
2. Edit any hut data (name, coordinates, photo, etc.)
3. Refresh your browser (after 24h cache expires, or clear cache manually)

### Add New Hut

1. Add a new row in Airtable "Huts" table
2. Fill in required fields: Name, Latitude, Longitude
3. Set Status to "Active"
4. Clear cache: `localStorage.removeItem('airtable_huts_cache')`
5. Refresh page

### Hide a Hut

- Change Status from "Active" to "Hidden"

### Force Refresh (Dev Console)

```javascript
// Reload huts from Airtable
await window.refreshHutsData();

// Or clear all caches
window.airtableService.clearCache();
location.reload();
```

---

## 🏗️ Architecture

### Data Flow

```
Airtable API
    ↓
airtable-config.js (fetch + cache)
    ↓
LocalStorage (24h cache)
    ↓
explore.html (loadHutsFromAirtable)
    ↓
renderHutsLayer() → Leaflet map
```

### Caching Strategy

- **First load**: Fetch from Airtable API → Save to LocalStorage
- **Subsequent loads** (within 24h): Load from LocalStorage (instant)
- **After 24h**: Re-fetch from API, update cache
- **Manual refresh**: `refreshHutsData()` bypasses cache

---

## 💰 Cost Estimate

### Free Plan (Recommended for Start)
- **1,000 API calls/month**
- With 24h cache: ~30 users/day = ~900 calls/month
- **Cost: $0**

### If You Outgrow Free Plan
- **Plus Plan**: $20/month → 100,000 calls
- **Pro Plan**: $45/month → Unlimited calls

**💡 Tip**: Free plan is enough for most small-medium projects with caching enabled.

---

## 🔜 Roadmap

### ✅ Completed
- [x] Huts migration from hardcoded array to Airtable

### 🚧 To-Do (Optional)
- [ ] Migrate F-Roads (`froadData` array)
- [ ] Migrate Campsites (`campsites` array)
- [ ] Add admin panel for cache management
- [ ] Environment variables for API keys
- [ ] Server-side proxy for API calls (hide keys)

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| No markers showing | Check Console for errors, verify API key |
| "Failed to load" error | Verify Base ID and API Token |
| Markers duplicate | Clear cache: `window.airtableService.clearCache()` |
| Changes not appearing | Cache may be active (24h), force refresh |

**See [AIRTABLE_SETUP.md](./AIRTABLE_SETUP.md#troubleshooting) for detailed debugging.**

---

## 🔒 Security Notes

### ⚠️ Current Setup (Client-Side API Key)

The current implementation stores the API key in `airtable-config.js` (client-side).

**Risks:**
- API key visible in browser source code
- Anyone can see and potentially misuse your key
- **Only use READ-ONLY scopes** (`data.records:read`)

### ✅ Production Recommendations

1. **Never commit API keys** to public repos
   - Add `airtable-config.js` to `.gitignore`
   - Use environment variables or server-side config

2. **Use server-side proxy** (recommended for production)
   ```
   Client → Your Server → Airtable API
   ```
   - Create an API endpoint on your server
   - Server makes Airtable requests with secret key
   - Client calls your endpoint (no key exposure)

3. **Restrict API key scopes**
   - Only grant `data.records:read`
   - Never use `data.records:write` unless absolutely needed

4. **Consider OAuth** for user-specific access

---

## 📞 Support

- **Setup issues**: See [AIRTABLE_SETUP.md](./AIRTABLE_SETUP.md)
- **Airtable API docs**: https://airtable.com/developers/web/api/introduction
- **API status**: https://status.airtable.com/

---

## 📄 License

Same license as main Froad project.

---

**Made with ❤️ for easier data management**
