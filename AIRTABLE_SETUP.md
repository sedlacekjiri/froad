# Airtable Setup Guide - Huts Integration

This guide walks you through setting up Airtable to manage your huts data instead of hardcoding it in `explore.html`.

## 📋 Benefits

- ✅ Easy editing via spreadsheet-like interface
- ✅ No code changes needed to update huts
- ✅ Share editing access with non-technical team members
- ✅ Automatic caching (24h) reduces API calls
- ✅ Free tier: 1000 API calls/month

---

## 🚀 Step 1: Create Airtable Account

1. Go to https://airtable.com/signup
2. Sign up (free plan is sufficient for testing)
3. Verify your email

---

## 📊 Step 2: Create Base and Table

### 2.1 Create a New Base

1. Click **"Create a base"** from your workspace
2. Choose **"Start from scratch"**
3. Name it: `Froad Data` (or any name you prefer)

### 2.2 Rename Table to "Huts"

1. Click on the default **"Table 1"** name
2. Rename it to: `Huts`

### 2.3 Create Columns (Fields)

Delete the default fields and create these columns:

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| `Name` | Single line text | Primary field (required) |
| `Latitude` | Number | Precision: 6 decimals |
| `Longitude` | Number | Precision: 6 decimals |
| `Link` | URL | Optional - link to hut info |
| `Photo` | URL | Direct image URL |
| `Description` | Long text | Optional - description for popup |
| `Status` | Single select | Options: "Active", "Hidden" |

**Important**: Match field names exactly as shown above (case-sensitive).

---

## 📥 Step 3: Import Existing Huts Data

### Option A: Import from CSV (Easiest)

1. In your Airtable base, click the **▼** next to "Huts" table name
2. Select **"Import data" → "CSV file"**
3. Upload the `huts-data.csv` file from this repo
4. Map the columns (should auto-match if names are correct)
5. Click **"Import"**

### Option B: Manual Entry

Copy data from the CSV or enter manually. Here's a sample row:

```
Name: Nyidalur FI Mountain Hut
Latitude: 64.734942
Longitude: -18.072574
Link: https://www.fi.is/en/mountain-huts/all-mountain-huts/nyidalur
Photo: https://cdn.prod.website-files.com/.../nyidalur-hut.jpg
Description: [Leave blank or add custom description]
Status: Active
```

---

## 🔑 Step 4: Get API Credentials

### 4.1 Get Base ID

1. Go to https://airtable.com/api
2. Click on your **"Froad Data"** base
3. In the URL, you'll see: `https://airtable.com/appXXXXXXXXXXXXXX/api/docs`
4. Copy the `appXXXXXXXXXXXXXX` part - this is your **BASE_ID**

### 4.2 Create API Key (Personal Access Token)

1. Go to https://airtable.com/create/tokens
2. Click **"Create new token"**
3. Give it a name: `Froad App`
4. Add these scopes:
   - ✅ `data.records:read`
5. Add access to your base:
   - Click **"Add a base"**
   - Select **"Froad Data"**
6. Click **"Create token"**
7. **COPY THE TOKEN** immediately (you won't see it again!)
   - Format: `patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

## ⚙️ Step 5: Configure Your App

1. Open `airtable-config.js`
2. Replace the placeholders with your actual values:

```javascript
const AIRTABLE_CONFIG = {
  BASE_ID: 'appXXXXXXXXXXXXXX',  // Your Base ID from Step 4.1
  API_KEY: 'patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',  // Your API Token from Step 4.2

  TABLES: {
    HUTS: 'Huts',
  },

  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
};
```

3. Save the file

**⚠️ Security Note**:
- Never commit `airtable-config.js` with real API keys to public repos
- Consider using environment variables or a config file outside version control
- For production, move sensitive keys to server-side or use Airtable's OAuth

---

## ✅ Step 6: Test the Integration

1. Open `explore.html` in your browser (or deploy to your server)
2. Open Browser DevTools Console (F12)
3. Look for these messages:

```
📡 Loading huts from Airtable...
✅ Using cached data for Huts
(or)
📡 Fetching fresh data from Airtable: Huts
💾 Cached data for: airtable_huts_cache
✅ Rendered 19 huts on map
```

4. Check that hut markers appear on the map
5. Click a marker to verify popup data is correct

---

## 🔄 Updating Huts Data

### Adding a New Hut

1. Go to your Airtable base
2. Add a new row with all required fields:
   - Name, Latitude, Longitude, Photo URL
   - Set Status to "Active"
3. **Refresh the browser** or **wait 24 hours** for cache to expire
4. Or manually clear cache in Console:
   ```javascript
   localStorage.removeItem('airtable_huts_cache');
   location.reload();
   ```

### Hiding a Hut (without deleting)

1. Change the hut's **Status** from "Active" to "Hidden"
2. Clear cache and refresh

### Force Refresh from Console

```javascript
// Manual refresh (bypasses cache)
await window.refreshHutsData();

// Or clear all Airtable cache
window.airtableService.clearCache();
location.reload();
```

---

## 🐛 Troubleshooting

### "Failed to load huts data" Error

**Check these:**

1. **API Key correct?**
   - Go to https://airtable.com/account and check your token is still valid
   - Make sure you copied the entire token (starts with `pat...`)

2. **Base ID correct?**
   - Verify it starts with `app` (not `tbl` or other prefix)
   - Check you're using the correct base

3. **Table name exact?**
   - Must be exactly `Huts` (case-sensitive)
   - Check for extra spaces

4. **Field names match?**
   - `Name`, `Latitude`, `Longitude` must match exactly
   - Check spelling and case

5. **CORS issues?**
   - Airtable API should work from browser, but check Console for CORS errors
   - If running locally, use a local server (not `file://` protocol)

### No Markers Showing Up

1. Open Console and check for errors
2. Run this to debug:
   ```javascript
   // Check if huts loaded
   const huts = await window.loadHutsFromAirtable();
   console.log('Loaded huts:', huts);

   // Verify coordinates
   huts.forEach(h => console.log(h.name, h.lat, h.lng));
   ```

3. Verify Latitude/Longitude are valid numbers (not text)

### Cache Not Clearing

```javascript
// Nuclear option - clear all localStorage
localStorage.clear();
location.reload();
```

---

## 💰 API Usage & Costs

### Free Plan Limits
- **1,000 API calls/month**
- Each page load = 1 call (if cache expired)
- Cache lasts 24 hours, so typically:
  - 30 users/day × 1 call = ~900 calls/month ✅

### Upgrading Plans

If you exceed free tier:

| Plan | Price | API Calls |
|------|-------|-----------|
| Plus | $20/user/month | 100,000/month |
| Pro | $45/user/month | Unlimited |

**Tip**: With 24h caching, you'll rarely hit the free limit unless you have very high traffic.

---

## 🔜 Next Steps: Migrate FRoads & Campsites

Once huts are working, you can migrate:

1. **FRoads** (F-road routes)
   - Create `FRoads` table in Airtable
   - Migrate `froadData` array (similar process)

2. **Campsites**
   - Create `Campsites` table
   - Migrate `campsites` array

3. **Weather Stations** (future)
   - Centralized management of weather data points

---

## 📞 Support

If you encounter issues:

1. Check Browser Console for error messages
2. Verify API key hasn't expired
3. Test with a minimal setup (1-2 huts first)
4. Check Airtable API status: https://status.airtable.com/

---

## ✅ Checklist

- [ ] Airtable account created
- [ ] "Froad Data" base created
- [ ] "Huts" table set up with correct fields
- [ ] Huts data imported from CSV
- [ ] Base ID copied from API docs
- [ ] API Token created with `data.records:read` scope
- [ ] `airtable-config.js` configured with real credentials
- [ ] Tested in browser - huts load successfully
- [ ] Verified markers appear on map
- [ ] Checked console for any errors

---

**🎉 Done! Your huts are now managed in Airtable.**

Update them anytime without touching code!
