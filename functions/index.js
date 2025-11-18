const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Cloud Function: Update road rating average when user rating changes
 *
 * Triggered by: Create/Update/Delete in ratings/{roadId}/userRatings/{userId}
 *
 * This function automatically recalculates the average rating and total count
 * whenever a user submits, updates, or deletes their rating for a road.
 */
exports.updateRoadRating = functions.firestore
  .document('ratings/{roadId}/userRatings/{userId}')
  .onWrite(async (change, context) => {
    const roadId = context.params.roadId;

    try {
      // Fetch all ratings for this road
      const ratingsSnapshot = await admin.firestore()
        .collection(`ratings/${roadId}/userRatings`)
        .get();

      let sum = 0;
      let count = 0;

      // Calculate sum and count
      ratingsSnapshot.forEach(doc => {
        const rating = doc.data().rating;
        if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
          sum += rating;
          count++;
        }
      });

      // Calculate average (1 decimal place)
      const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

      // Update stats document
      await admin.firestore()
        .doc(`ratings/${roadId}`)
        .set({
          averageRating: average,
          totalRatings: count,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

      console.log(`✅ Updated rating for ${roadId}: ${average} (${count} ratings)`);
      return null;

    } catch (error) {
      console.error(`❌ Error updating rating for ${roadId}:`, error);
      throw error;
    }
  });

/**
 * Cloud Function: Sync email verification status to Firestore
 *
 * Triggered by: User account creation in Firebase Auth
 *
 * This function automatically updates the emailVerified field in Firestore
 * when a new user is created.
 */
exports.syncEmailVerificationOnCreate = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const emailVerified = user.emailVerified || false;

  try {
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .set({
        emailVerified: emailVerified,
        lastEmailVerificationCheck: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

    console.log(`✅ Email verification synced on create for user ${uid}: ${emailVerified}`);
    return null;
  } catch (error) {
    console.error(`❌ Error syncing email verification for ${uid}:`, error);
    throw error;
  }
});
