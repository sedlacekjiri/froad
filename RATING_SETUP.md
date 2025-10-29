# F-roads Rating System - Setup Guide

This guide explains how to deploy the rating system for F-roads in the Froad app.

## 🎯 Features

- **Star Rating (1-5)**: Users can rate F-roads from 1 to 5 stars
- **Average Display**: Shows average rating with 1 decimal place (e.g., 4.5)
- **One Rating Per User**: Each user can only submit one rating per road
- **Edit Rating**: Users can update their existing rating
- **Anonymous**: Ratings are anonymous - only the numbers are visible
- **Automatic Calculation**: Cloud Function automatically recalculates averages

## 📁 Files Added

### Frontend (explore.html)
- **Rating UI**: Star display under road name in side panel
- **Rating Modal**: 5-star selection popup
- **CSS Styling**: Clean, modern design matching app style
- **JavaScript**: Rating submission and display logic
- **Firebase Integration**: Connects to Firestore for data storage

### Backend
- **Cloud Function** (`functions/index.js`): Auto-calculates rating averages
- **Security Rules** (`firestore.rules`): Controls who can read/write ratings

## 🚀 Deployment Steps

### Step 1: Deploy Firestore Security Rules

```bash
# Navigate to project directory
cd /path/to/froad

# Deploy rules to Firebase
firebase deploy --only firestore:rules
```

### Step 2: Deploy Cloud Function

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Cloud Functions (if first time)
firebase init functions
# Select: Use existing project
# Choose: JavaScript
# Install dependencies: Yes

# Deploy the function
firebase deploy --only functions
```

**Alternative**: Deploy via Firebase Console
1. Go to Firebase Console → Functions
2. Create new function
3. Copy code from `functions/index.js`
4. Set trigger: Firestore → `ratings/{roadId}/userRatings/{userId}` → onCreate/onUpdate/onDelete

### Step 3: Test the Rating System

1. Open the app and navigate to Explore
2. Click on any F-road to open the side panel
3. You should see: `⭐ -- (0)` under the road name
4. Click **"Rate this road"** button
5. Select 1-5 stars and submit
6. Rating should update immediately

## 📊 Firestore Structure

```
ratings/
  ├── F26/                           # Road ID
  │   ├── averageRating: 4.5        # Calculated average
  │   ├── totalRatings: 12          # Number of ratings
  │   ├── lastUpdated: timestamp
  │   └── userRatings/              # Sub-collection
  │       ├── {userId_ABC}/
  │       │   ├── rating: 5
  │       │   ├── createdAt: timestamp
  │       │   └── updatedAt: timestamp
  │       └── {userId_XYZ}/
  │           ├── rating: 4
  │           ├── createdAt: timestamp
  │           └── updatedAt: timestamp
  └── F208/
      └── ... (same structure)
```

## 🔒 Security Rules

- **Anyone** can read ratings
- **Authenticated users** can submit/update their own rating
- **Only Cloud Function** can update the stats document
- **Validation**: Rating must be a number between 1 and 5

## 🧪 Testing

### Test Rating Submission
```javascript
// In browser console (on explore page)
const user = firebase.auth().currentUser;
if (user) {
  db.doc('ratings/F26/userRatings/' + user.uid).set({
    rating: 5,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
```

### Check Cloud Function Logs
```bash
firebase functions:log
```

## ⚠️ Important Notes

### Client-Side Calculation (Current Implementation)
The rating average is currently calculated **client-side** in `explore.html` (line 3309-3328). This is a **temporary solution** until you deploy the Cloud Function.

**Why?**
- Works immediately without Cloud Function setup
- Good for testing and development
- Users can see their rating impact instantly

**Limitations:**
- Slightly slower (fetches all ratings)
- Could have race conditions with multiple simultaneous ratings

### After Deploying Cloud Function
Once the Cloud Function is deployed, you can **optionally remove** the client-side calculation (lines 3309-3328) and let the function handle it automatically. The app will still work because it reloads the rating after submission (line 3331).

## 🐛 Troubleshooting

### Rating doesn't appear
- Check browser console for errors
- Verify Firebase is initialized in explore.html
- Check that user is logged in

### "Permission denied" error
- Deploy firestore.rules
- Check user authentication status

### Cloud Function not triggering
- Check function deployment: `firebase functions:list`
- View logs: `firebase functions:log`
- Verify trigger path matches: `ratings/{roadId}/userRatings/{userId}`

## 📈 Future Enhancements

- Add rating distribution chart (e.g., "5★: 60%, 4★: 30%...")
- Show "You rated this X stars" indicator
- Add rating trends over time
- Export ratings data for analysis

## 💰 Costs

- **Firestore reads**: ~1-2 reads per road view (minimal)
- **Cloud Function**: ~1 execution per rating submission
- **Estimated cost**: < $1/month for typical usage

---

✅ **Ready to go!** Users can now rate F-roads and help others find the best routes.
