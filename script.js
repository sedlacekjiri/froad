    // Firebase init
    const config = {
      apiKey: "AIzaSyDDMNnJgtm-gK9OrVev7qmBRpaA8CAoDiM",
      authDomain: "froad-7d561.firebaseapp.com",
      projectId: "froad-7d561",
      storageBucket: "froad-7d561.firebasestorage.app",
      messagingSenderId: "1086299585443",
      appId: "1:1086299585443:web:10bcb67effd6a89c24f816"
    };
    firebase.initializeApp(config);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage(firebase.app(), "gs://froad-7d561.firebasestorage.app"); 


    // DOM references
    const loginScreen = document.getElementById("loginScreen");
    const logoutBtn = document.getElementById("logoutBtn");
    const profileIcon = document.getElementById("profileIcon");
    const profileEditor = document.getElementById("profileEditor");
    const currentAvatar = document.getElementById("currentAvatar");
    const avatarInput = document.getElementById("avatarInput");
    const displayNameInput = document.getElementById("displayNameInput");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const vehiclePhotoInput = document.getElementById("vehiclePhoto");
    const vehiclePhotoPreview = document.getElementById("vehiclePhotoPreview");

// =====================================================
// UPDATES SECTION WITH RELATIVE TIME
// =====================================================

// Updates will be loaded from Firestore in real-time
let UPDATES = [];

// Parse update time string to Date object
function parseUpdateTime(str) {
  const m = String(str).match(/^\s*(\d{1,2}):(\d{2})\s*,\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$/);
  if (!m) return null;
  const hh = +m[1], mm = +m[2], d = +m[3], mon = +m[4], y = +m[5];
  return new Date(y, mon - 1, d, hh, mm);
}

// Calculate relative time (e.g., "2 days ago", "30 days ago")
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) {
    return diffYear === 1 ? '1 year ago' : `${diffYear} years ago`;
  }
  if (diffMonth > 0) {
    return diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
  }
  if (diffWeek > 0) {
    return diffWeek === 1 ? '1 week ago' : `${diffWeek} weeks ago`;
  }
  if (diffDay > 0) {
    return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
  }
  if (diffHour > 0) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  }
  if (diffMin > 0) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  }
  return 'Just now';
}

// Render updates to the home section
function renderUpdates() {
  console.log('🔄 renderUpdates() called');
  const container = document.getElementById('updatesContainer');

  if (!container) {
    console.log('❌ updatesContainer not found');
    return;
  }

  if (UPDATES.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#6b7280;">No updates at the moment.</div>';
    return;
  }

  console.log('✅ updatesContainer found, rendering', UPDATES.length, 'updates');

  // Filter updates to show only those from the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recentUpdates = UPDATES.filter(update => {
    // Use createdAt timestamp if available
    if (update.createdAt && update.createdAt.toDate) {
      const updateDate = update.createdAt.toDate();
      return updateDate >= fourteenDaysAgo;
    }
    // Fallback to parsing the time string
    const date = parseUpdateTime(update.time);
    if (date) {
      return date >= fourteenDaysAgo;
    }
    // If no valid date, exclude the update
    return false;
  });

  console.log(`📅 Filtered to ${recentUpdates.length} updates from last 14 days (from ${UPDATES.length} total)`);

  if (recentUpdates.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#6b7280;">No updates in the last 14 days.</div>';
    return;
  }

  const html = recentUpdates.map(update => {
    // Use createdAt timestamp first, fallback to parsing time string
    const date = update.createdAt && update.createdAt.toDate
      ? update.createdAt.toDate()
      : parseUpdateTime(update.time);
    const relativeTime = date ? getRelativeTime(date) : update.time;

    return `
      <div class="update-item">
        <div class="update-header">
          <span class="update-type type-${update.type}">${update.type}</span>
          <span class="update-time">${relativeTime}</span>
        </div>
        <div class="update-text">${update.text}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
  console.log('✅ Updates rendered successfully');
}

// Load updates from Firestore in real-time
function loadUpdatesFromFirestore() {
  console.log('🔄 Setting up Firestore listener for updates...');

  db.collection('updates')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      console.log('📡 Updates snapshot received:', snapshot.size, 'documents');

      UPDATES = [];
      snapshot.forEach(doc => {
        UPDATES.push(doc.data());
      });

      console.log('✅ UPDATES array updated:', UPDATES.length, 'updates');
      renderUpdates();
    }, err => {
      console.error('❌ Error loading updates from Firestore:', err);
    });
}

// Initialize updates listener
loadUpdatesFromFirestore();

    // ✅ Avatar preview po výběru fotky
avatarInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  // Limit velikosti 2 MB
  if (file.size > 2 * 1024 * 1024) {
    alert("Profile photo is too large. Please upload a file under 2 MB.");
    avatarInput.value = ""; // reset input
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    currentAvatar.src = ev.target.result; // zobrazí okamžitě fotku
  };
  reader.readAsDataURL(file);
});


    vehiclePhotoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;


  // ✅ Limit 2 MB
  if (file.size > 2 * 1024 * 1024) {
    alert("Vehicle photo is too large. Please upload a file under 2 MB.");
    vehiclePhotoInput.value = ""; // reset input
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    vehiclePhotoPreview.src = ev.target.result;
    vehiclePhotoPreview.style.display = "block";
    const placeholder = document.getElementById("vehiclePhotoPlaceholder");
    const deleteBtn = document.getElementById("deleteVehiclePhotoBtn");
    if (placeholder) placeholder.style.display = "none";
    if (deleteBtn) deleteBtn.style.display = "flex";
  };
  reader.readAsDataURL(file);
});

    const mapContainer = document.getElementById("mapContainer");
    const mapDiv = document.getElementById("map");
    const chatDiv = document.getElementById("chat");
    const formEl = document.getElementById("form");
    const msgInput = document.getElementById("msgInput");
    const sendBtn = document.getElementById("sendBtn");

    const emailForm = document.getElementById("emailLoginForm");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const signupForm = document.getElementById("signupForm");
    const signupEmail = document.getElementById("signupEmail");
    const signupPassword = document.getElementById("signupPassword");
    const toSignup = document.getElementById("toSignup");
    const toLogin = document.getElementById("toLogin");

    const liveMarkers = {};
    let liveWatchId = null;

    const authTitle = document.getElementById("authTitle");

// ✅ Handle email verification from Firebase link
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
const oobCode = urlParams.get('oobCode');

if (mode === 'verifyEmail' && oobCode) {
  // Apply the verification code
  auth.applyActionCode(oobCode)
    .then(async () => {
      console.log("✅ Email verification successful!");
      const loginError = document.getElementById("loginError");
      loginError.textContent = "✅ Email confirmed! You can now log in.";
      loginError.style.color = "#22c55e"; // Green color

      // ✅ If user is logged in, update their emailVerified status in Firestore immediately
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.reload(); // Refresh user data from Firebase Auth
          const freshUser = auth.currentUser;

          // Update Firestore with new emailVerified status
          await db.collection("users").doc(freshUser.uid).update({
            emailVerified: freshUser.emailVerified || false,
            lastEmailVerificationCheck: firebase.firestore.FieldValue.serverTimestamp()
          });

          console.log("✅ Email verification status synced to Firestore:", freshUser.emailVerified);
        } catch (error) {
          console.error("❌ Error syncing email verification to Firestore:", error);
        }
      }

      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    })
    .catch((error) => {
      console.error("❌ Email verification failed:", error);
      const loginError = document.getElementById("loginError");
      loginError.textContent = "Email verification link is invalid or expired.";
      loginError.style.color = "#ef4444"; // Red color
      window.history.replaceState({}, document.title, window.location.pathname);
    });
}

// === Image upload for chat ===
const imageInput = document.getElementById("imageUpload");
const uploadInfo = document.getElementById("uploadInfo");
const uploadText = document.getElementById("uploadText");
const cancelUpload = document.getElementById("cancelUpload");

imageInput.addEventListener("change", () => {
  const files = imageInput.files;
  if (files.length === 0) {
    uploadInfo.style.display = "none";
    return;
  }

  let totalSize = 0;
  for (let file of files) totalSize += file.size;

  if (totalSize > 2 * 1024 * 1024) {
    uploadText.textContent = "❌ File too large (max 2 MB)";
    uploadInfo.classList.add("error");
  } else {
    uploadText.textContent =
      files.length === 1 ? "1 file uploaded" : `${files.length} files uploaded`;
    uploadInfo.classList.remove("error");
  }

  uploadInfo.style.display = "flex";
});

cancelUpload.addEventListener("click", () => {
  imageInput.value = "";
  uploadInfo.style.display = "none";
});

// Toggle login / signup forms
toSignup.querySelector("a").addEventListener("click", e => {
  e.preventDefault();
  emailForm.style.display = "none";
  signupForm.style.display = "flex";
  toSignup.style.display = "none";
  toLogin.style.display = "block";
  authTitle.textContent = "Sign Up";
});

toLogin.querySelector("a").addEventListener("click", e => {
  e.preventDefault();
  emailForm.style.display = "flex";
  signupForm.style.display = "none";
  toSignup.style.display = "block";
  toLogin.style.display = "none";
  authTitle.textContent = "Log In";
});

    // Email login
    emailForm.addEventListener("submit", async e => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const errorEl = document.getElementById("loginError");
      try {
        await auth.signInWithEmailAndPassword(email, password);
        errorEl.textContent = "";
      } catch (err) {
        console.error("Login error:", err);
        errorEl.textContent = "Incorrect email or password. Try again.";
      }
    });

  // Signup
signupForm.addEventListener("submit", async e => {
  e.preventDefault();
  const fullName = document.getElementById("signupFullName").value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const errorEl = document.getElementById("loginError");

  if (!fullName) {
    errorEl.textContent = "Please enter your full name.";
    return;
  }

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    let user = cred.user;

    // Nastav displayName v Auth
    await user.updateProfile({ displayName: fullName });

    // ✅ Reload user to ensure displayName is propagated
    await user.reload();
    user = auth.currentUser;
    console.log("✅ DisplayName set in Auth:", user.displayName);

    // ✅ Odeslání confirmation emailu s redirect URL
    const actionCodeSettings = {
      url: window.location.origin + '/index.html',
      handleCodeInApp: true
    };
    await user.sendEmailVerification(actionCodeSettings);
    console.log("✅ Confirmation email sent to:", email);

    // Vytvoř výchozí profil ve Firestore
    await db.collection("users").doc(user.uid).set({
      displayName: fullName,
      email: email,
      photoURL: "",
      bio: "",
      instagram: "",
      vehicle: "",
      vehiclePhotoURL: "",
      verified: false,
      ranger: false,
      access: false,
      emailVerified: false, // ✅ Stav potvrzení emailu
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    errorEl.textContent = "";
    showAccessDeniedModal();
    await auth.signOut();
  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === "auth/email-already-in-use") {
      errorEl.textContent = "Looks like you already have an account! Try logging in.";
    } else if (err.code === "auth/weak-password") {
      errorEl.textContent = "Password is too weak. Please use at least 6 characters.";
    } else if (err.code === "auth/invalid-email") {
      errorEl.textContent = "Invalid email address.";
    } else {
      errorEl.textContent = "Registration failed. Please try again.";
    }
  }
});


    // Auth listener
auth.onAuthStateChanged(async user => {
  if (!user) {
    // ✅ Reset UI při novém přihlášení
document.getElementById("chat").style.display = "none";
document.getElementById("form").style.display = "none";
document.getElementById("chatHeader").style.display = "none";
document.getElementById("chatGroups").style.display = "none";
    // Not logged in
    loginScreen.style.display = "flex";
    formEl.style.display = "none";
    chatDiv.style.display = "none";
    mapContainer.style.display = "none";
    logoutBtn.style.display = "none";

    // 🔒 BEZPEČNOSTNÍ FIX: Vyčisti všechny inputy při odhlášení
    displayNameInput.value = "";
    document.getElementById("bioInput").value = "";
    document.getElementById("instagramInput").value = "";
    document.getElementById("vehicleSelect").value = "";
    currentAvatar.src = "https://www.gravatar.com/avatar?d=mp";
    vehiclePhotoPreview.src = "";
    vehiclePhotoPreview.style.display = "none";
    const vehiclePhotoPlaceholder = document.getElementById("vehiclePhotoPlaceholder");
    const deleteVehiclePhotoBtn = document.getElementById("deleteVehiclePhotoBtn");
    if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "flex";
    if (deleteVehiclePhotoBtn) deleteVehiclePhotoBtn.style.display = "none";
    avatarInput.value = "";
    vehiclePhotoInput.value = "";

    return;
  }

  // ✅ Reload user data from Firebase Auth to get fresh emailVerified status
  try {
    await user.reload();
    user = auth.currentUser; // Get the refreshed user object
    console.log("✅ User data reloaded, emailVerified:", user.emailVerified);
    console.log("✅ User displayName from Auth:", user.displayName);
  } catch (error) {
    console.error("❌ Error reloading user data:", error);
  }

  // === Výchozí aktivní tab = HOME ===
document.querySelectorAll('.footer-btn').forEach(b => b.classList.remove('active'));
const homeBtn = document.querySelector('.footer-btn.home-btn');
if (homeBtn) {
  homeBtn.classList.add('active');
  const homeIcon = homeBtn.querySelector('.home-icon');
  if (homeIcon)
    homeIcon.src = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/690214cdec9d2efab9720566_home-focus.png"; // aktivní Home ikonka
}

// ✅ Reset všech ikon do výchozího stavu
const exploreIcon = document.querySelector('.explore-btn .explore-icon');
if (exploreIcon) {
  exploreIcon.src = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed640a5b1f7f0d0f842643_map%20(3).png";
}
const chatIcon = document.querySelector('.chat-btn .chat-icon');
if (chatIcon) {
  chatIcon.src = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed60dbeff425a3e7d0d35e_paper-plane.png";
}
const mapIcon = document.querySelector('.map-btn .map-icon');
if (mapIcon) {
  mapIcon.src = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68efa731bab109784845d316_people.png";
}


// Zobraz Home jako výchozí sekci
const homeSectionEl = document.getElementById('homeSection');
const exploreMapEl = document.getElementById('exploreMap');
const mapContainerEl = document.getElementById('mapContainer');
const chatDivEl = document.getElementById('chat');
const formElEl = document.getElementById('form');

if (homeSectionEl) homeSectionEl.style.display = "block";
if (exploreMapEl) exploreMapEl.style.display = "none";
if (mapContainerEl) mapContainerEl.style.display = "none";
if (chatDivEl) chatDivEl.style.display = "none";
if (formElEl) formElEl.style.display = "none";

// Initialize FAQ on home page load
if (homeSectionEl) {
  setTimeout(() => {
    initializeFAQ();
    initJournalSlider();
    // Updates are loaded automatically via Firestore listener
  }, 100);
}

// ✅ Skryj Share Location tlačítko při načtení (jen People ho má mít)
const shareBtn = document.getElementById('shareLocationBtn');
if (shareBtn) {
  shareBtn.style.display = "none";
}

// ✅ SKRYJ I VISIBILITY TLAČÍTKO PŘI STARTU
const visibilityBtn = document.getElementById('visibilityBtn');
if (visibilityBtn) {
  visibilityBtn.style.display = "none";
}


  // === LOAD / INIT USER DOC ===
  const userRef = db.collection("users").doc(user.uid);
// 🔒 Vždy načti ze serveru, ne z cache (bezpečnostní fix)
let userDoc = await userRef.get({ source: 'server' });

// ✅ Pokud dokument neexistuje, počkej chvíli (signup handler ho možná právě vytváří)
if (!userDoc.exists) {
  console.log("⏳ User doc doesn't exist, waiting 1 second for signup handler...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  userDoc = await userRef.get({ source: 'server' });
}

if (!userDoc.exists) {
  // ✅ Dokument stále neexistuje - vytvoř nový s displayName z Auth (ne "User"!)
  const displayNameToUse = user.displayName || user.email?.split('@')[0] || "User";
  console.log("✅ Creating new user doc with displayName:", displayNameToUse);

  await userRef.set({
    displayName: displayNameToUse,
    email: user.email || "",
    photoURL: "",
    bio: "",
    instagram: "",
    vehicle: "",
    vehiclePhotoURL: "",
    verified: false,
    ranger: false,
    access: false,
    emailVerified: user.emailVerified || false, // ✅ Synchronizace z Firebase Auth
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  console.log("✅ New clean profile created for:", user.uid);
} else {
  // 🧹 Reset cizích dat při novém přihlášení (bez access)
  const existingData = userDoc.data();
  console.log("📋 Existing user data:", existingData);

  if (existingData && !existingData.access) {
    // 🔒 BEZPEČNOSTNÍ FIX: Pro uživatele bez access zachovej displayName pokud existuje
    // Pokud displayName v dokumentu neexistuje, vezmi ho z Auth nebo z emailu
    const displayNameToKeep = existingData.displayName || user.displayName || user.email?.split('@')[0] || "User";
    console.log("🔄 User without access. DisplayName to keep:", displayNameToKeep);
    console.log("   - from Firestore:", existingData.displayName);
    console.log("   - from Auth:", user.displayName);

    // ✅ Pro nové uživatele (čerstvě zaregistrované) zachovej displayName, ale resetuj ostatní pole
    await userRef.set({
      displayName: displayNameToKeep,
      email: existingData.email || user.email || "",
      bio: existingData.bio || "",  // ✅ Zachovej bio pokud existuje
      instagram: existingData.instagram || "",  // ✅ Zachovej instagram
      vehicle: existingData.vehicle || "",  // ✅ Zachovej vehicle
      vehiclePhotoURL: existingData.vehiclePhotoURL || "",  // ✅ Zachovej vehicle photo
      photoURL: existingData.photoURL || "",  // ✅ Zachovej avatar
      verified: false,
      ranger: false,
      access: false,
      emailVerified: user.emailVerified || false,
      createdAt: existingData.createdAt || firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Preserved user data for user without access:", user.uid);
  } else {
    // ✅ Aktualizuj emailVerified při každém přihlášení
    await userRef.update({
      emailVerified: user.emailVerified || false
    });
    console.log("✅ Email verification status updated:", user.emailVerified);
  }
}

// 🧠 Načti znovu čerstvá data VŽDY ZE SERVERU (ne z cache) - bezpečnostní fix
const refreshedDoc = await userRef.get({ source: 'server' });
const userData = refreshedDoc.data() || {};

// 🔄 Synchronizuj Auth profil s Firestore daty (ne naopak!)
if (userData.displayName && user.displayName !== userData.displayName) {
  await user.updateProfile({ displayName: userData.displayName });
}
if (userData.photoURL && user.photoURL !== userData.photoURL) {
  await user.updateProfile({ photoURL: userData.photoURL });
}

// ✅ Aktualizuj Welcome text s jménem uživatele
const homeWelcome = document.getElementById('homeWelcome');
if (homeWelcome && userData.displayName) {
  const firstName = userData.displayName.split(' ')[0];
  homeWelcome.textContent = `Welcome, ${firstName} 👋`;
}

  // ✅ Zobraz vehicle photo nebo placeholder v profile editoru
  const vehiclePhotoPlaceholder = document.getElementById("vehiclePhotoPlaceholder");
  const deleteVehiclePhotoBtn = document.getElementById("deleteVehiclePhotoBtn");
  if (userData.vehiclePhotoURL && userData.vehiclePhotoURL.trim()) {
    vehiclePhotoPreview.src = userData.vehiclePhotoURL;
    vehiclePhotoPreview.style.display = "block";
    if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "none";
    if (deleteVehiclePhotoBtn) deleteVehiclePhotoBtn.style.display = "flex";
  } else {
    vehiclePhotoPreview.style.display = "none";
    if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "flex";
    if (deleteVehiclePhotoBtn) deleteVehiclePhotoBtn.style.display = "none";
  }

  // ✅ Store email verification status globally
  window.isEmailVerified = user.emailVerified || false;

  // ✅ Access kontrola
  if (!userData.access) {
    showAccessDeniedModal();
    await auth.signOut();
    return;
  }

// Prefill editor
const defaultPhoto = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f42acf3f8263cdf39637b0_unknown.jpg";

displayNameInput.value = userData.displayName || "";
currentAvatar.src = userData.photoURL || defaultPhoto;

const vehicleSelect = document.getElementById("vehicleSelect");
if (vehicleSelect) vehicleSelect.value = userData.vehicle || "";

const headerName = document.getElementById("headerName");
if (headerName) {
  const firstName = (userData.displayName || "User").split(" ")[0];
  headerName.textContent = firstName;
}

// === Header user photo ===
if (profileIcon) {
  profileIcon.src = userData.photoURL || defaultPhoto;
}

// 🔒 BEZPEČNOSTNÍ FIX: Vždy nastav hodnoty (i prázdné), aby se přepsala stará data
document.getElementById("bioInput").value = userData.bio || "";
document.getElementById("instagramInput").value = userData.instagram || "";


  // Toggle editor
  if (!profileIcon.hasAttribute("data-listener")) {
  profileIcon.setAttribute("data-listener", "true");
  profileIcon.addEventListener("click", () => {
    profileEditor.style.display =
      profileEditor.style.display === "flex" ? "none" : "flex";
  });
}

  // === Zobrazení hlavní části ===
  loginScreen.style.display = "none";
  mapContainer.style.display = "none";
  chatDiv.style.display = "none";
  formEl.style.display = "none";
  logoutBtn.style.display = "inline-block";

  // Zobraz Home jako výchozí sekci po přihlášení
  const homeSection = document.getElementById('homeSection');
  if (homeSection) homeSection.style.display = "block";

  if (user.photoURL) {
    profileIcon.classList.remove("fallback");
    profileIcon.src = user.photoURL;
  } else {
    profileIcon.classList.add("fallback");
    profileIcon.textContent = (user.displayName || "U")[0].toUpperCase();
  }

  initMap();
  setupLiveLocations();
  loadMessages();
  setupGoLiveButton();
  // ✅ Zkontroluj při loginu / refreshi, jestli má uživatel hidden = true, a uprav ikonku
try {
  const liveDoc = await db.collection("liveLocations").doc(user.uid).get();
  const iconEl = document.getElementById("visibilityIcon");

  if (liveDoc.exists && liveDoc.data().hidden === true) {
    iconEl.src = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f6a54af63bb9cb97f07730_visibility.png"; // přeškrtnuté oko
  } else {
    iconEl.src = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f6a54a2914de7af9a65d54_blind.png"; // otevřené oko
  }
} catch (err) {
  console.error("❌ Error loading hidden state:", err);
}
});

// 🧠 Načti poslední avatary z každé skupiny (pouze aktivní ≤24 h)
async function loadGroupAvatars() {
  const groups = [
    "general", "river", "froads", "weather",
    "campsites", "cars", "alerts", "photos", "help", "community"
  ];

  const defaultAvatar = "https://www.gravatar.com/avatar?d=mp";
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000; // 24 hodin v ms

  for (const group of groups) {
    try {
      const snap = await db
        .collection(`messages_${group}`)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      const uniqueUsers = [];
      const avatars = [];

      snap.forEach(doc => {
        const data = doc.data();
        if (
          data.photoURL &&
          data.uid &&
          data.createdAt &&
          data.createdAt.toMillis() > cutoff &&   // 🧩 jen noví (≤24 h)
          !uniqueUsers.includes(data.uid)
        ) {
          uniqueUsers.push(data.uid);
          avatars.push(data.photoURL);
        }
      });

      const container = document.getElementById(`avatars-${group}`);
      if (!container) continue;
      container.innerHTML = "";

      avatars.slice(0, 3).forEach(url => {
        const img = document.createElement("img");
        img.src = url || defaultAvatar;
        container.appendChild(img);
      });

    } catch (err) {
      console.warn(`⚠️ Error loading avatars for ${group}:`, err);
    }
  }
}

// 🚀 Spusť po načtení uživatele
loadGroupAvatars();
setInterval(loadGroupAvatars, 20000); // refresh každých 20 s

// 🚀 Spusť po načtení uživatele
loadGroupAvatars();

// 💫 Auto-refresh každých 20 sekund
setInterval(loadGroupAvatars, 20000);


    logoutBtn.onclick = () => {
  // 🧹 Schovej vše kromě loginu
  document.getElementById("chat").style.display = "none";
  document.getElementById("form").style.display = "none";
  document.getElementById("exploreMap").style.display = "none";
  document.getElementById("mapContainer").style.display = "none";
  document.getElementById("chatHeader").style.display = "none";
  document.getElementById("chatGroups").style.display = "none";

  // 🧼 Zavři editory, panely
  profileEditor.style.display = "none";

  // 🔒 BEZPEČNOSTNÍ FIX: Vyčisti všechny inputy v profileEditoru
  displayNameInput.value = "";
  document.getElementById("bioInput").value = "";
  document.getElementById("instagramInput").value = "";
  document.getElementById("vehicleSelect").value = "";
  currentAvatar.src = "https://www.gravatar.com/avatar?d=mp";
  vehiclePhotoPreview.src = "";
  vehiclePhotoPreview.style.display = "none";
  const vehiclePhotoPlaceholder = document.getElementById("vehiclePhotoPlaceholder");
  const deleteVehiclePhotoBtn = document.getElementById("deleteVehiclePhotoBtn");
  if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "flex";
  if (deleteVehiclePhotoBtn) deleteVehiclePhotoBtn.style.display = "none";
  avatarInput.value = "";
  vehiclePhotoInput.value = "";

  // Zobraz login screen
  loginScreen.style.display = "flex";

  auth.signOut();
};

// === Resend Verification Email Button ===
const resendVerificationBtn = document.getElementById("resendVerificationBtn");
if (resendVerificationBtn) {
  resendVerificationBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("No user is currently logged in.");
      return;
    }

    if (user.emailVerified) {
      alert("Your email is already verified!");
      return;
    }

    try {
      await user.sendEmailVerification();
      alert("Verification email sent! Please check your inbox.");
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
      if (error.code === "auth/too-many-requests") {
        alert("Too many requests. Please try again later.");
      } else {
        alert("Failed to send verification email. Please try again later.");
      }
    }
  });
}


    function showAccessDeniedModal() {
      document.getElementById("accessDeniedModal").style.display = "flex";
    }
    function closeAccessModal() {
      document.getElementById("accessDeniedModal").style.display = "none";

      // Přepni na login formulář po zavření modalu
      document.getElementById("emailLoginForm").style.display = "flex";
      document.getElementById("signupForm").style.display = "none";
      document.getElementById("toSignup").style.display = "block";
      document.getElementById("toLogin").style.display = "none";
      document.getElementById("authTitle").textContent = "Log in";
    }

    // 🌍 Globální proměnné pro přepínání vrstev
let map, osmLayer, satelliteLayer, isSatellite = false;

function initMap() {
  if (!map) {
    map = L.map(mapDiv).setView([64.1466, -21.9426], 6);

    // 🗺️ Standardní (OpenStreetMap)
    osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map); // výchozí vrstva

    // 🛰️ Satelitní (Esri)
    satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      }
    );

    // 🔧 (nepoužíváme L.control.layers, protože máme vlastní tlačítko)
  }
}

// === Satellite Toggle Button ===
const customActionBtn = document.getElementById("customActionBtn");

if (customActionBtn) {
  customActionBtn.addEventListener("click", () => {
    if (!isSatellite) {
      map.removeLayer(osmLayer);
      map.addLayer(satelliteLayer);
      isSatellite = true;
      console.log("🛰️ Satellite view ON");
    } else {
      map.removeLayer(satelliteLayer);
      map.addLayer(osmLayer);
      isSatellite = false;
      console.log("🗺️ Map view ON");
    }

    // 💫 Krátká animace ikonky
    const icon = document.getElementById("customActionIcon");
    icon.style.transition = "transform 0.4s ease";
    icon.style.transform = "rotate(360deg)";
    setTimeout(() => (icon.style.transform = "rotate(0deg)"), 400);
  });
}

// === Dynamické zarovnání Satellite tlačítka pod Visibility ===
function positionCustomActionBtn() {
  const visBtn = document.getElementById("visibilityBtn");
const customBtn = document.getElementById("customActionBtn");

requestAnimationFrame(() => {
  positionCustomActionBtn();
});

  if (!visBtn || !customBtn) return;

  const visHeight = visBtn.offsetHeight;
  const offset = 10; // vzdálenost mezi tlačítky

  // získej aktuální vzdálenost viditelného tlačítka od spodku okna
  const visBottom = parseFloat(window.getComputedStyle(visBtn).bottom);

  // 👇 VYPOČÍTÁME pozici tak, aby custom byl POD viditelným tlačítkem
  const newBottom = visBottom - visHeight - offset;

  customBtn.style.position = "fixed";
  customBtn.style.right = "20px";
  customBtn.style.bottom = `${newBottom}px`;
}

// spustí se po načtení i při změně velikosti okna
window.addEventListener("load", positionCustomActionBtn);
window.addEventListener("resize", positionCustomActionBtn);






    function setupLiveLocations() {
  db.collection("liveLocations").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      const uid = change.doc.id;
      const data = change.doc.data();

      // 🧠 Force local "Live" state if I'm currently sharing
const isCurrentUser = auth.currentUser && auth.currentUser.uid === uid;
if (isCurrentUser && liveWatchId !== null) {
  data.isLive = true;
  data.lastSeen = firebase.firestore.Timestamp.now(); // sync local time
}

      // === Pokud marker existuje, ale už není live ===
      if ((change.type === "modified" && data && data.isLive === false) || change.type === "removed") {
        if (liveMarkers[uid]) {
          map.removeLayer(liveMarkers[uid]);
          delete liveMarkers[uid];
        }
        return; // ukončí se pro tento dokument
      }

      // === Přidání nebo update aktivních markerů ===
      if (change.type === "added" || change.type === "modified") {
  const lat = data.lat;
  const lng = data.lng;
  const avatarUrl = data.photoURL || "https://www.gravatar.com/avatar?d=mp";

  // 🧩 Auto-refresh dat uživatele v People panelu
const content = document.getElementById("userDetailContent");
if (content && auth.currentUser && auth.currentUser.uid === uid) {
  const bioEl = document.getElementById("userBioText");
  const vehicleEl = document.getElementById("userVehicleText");
  const vehicleImg = document.getElementById("userVehiclePhoto");

  if (bioEl) bioEl.textContent = data.bio || "";
  if (vehicleEl) vehicleEl.textContent = data.vehicle || "";

  // ✅ Zobraz vehicle photo nebo placeholder
  const vehicleImgPlaceholder = document.getElementById("userVehiclePhotoPlaceholder");
  if (vehicleImg) {
    if (data.vehiclePhotoURL && data.vehiclePhotoURL.trim()) {
      vehicleImg.src = data.vehiclePhotoURL;
      vehicleImg.style.display = "block";
      if (vehicleImgPlaceholder) vehicleImgPlaceholder.style.display = "none";
    } else {
      vehicleImg.style.display = "none";
      if (vehicleImgPlaceholder) vehicleImgPlaceholder.style.display = "flex";
    }
  }
}


   // ✅ Bez souřadnic nic nevykresluj (a smaž případný starý marker)
  if (typeof lat !== "number" || typeof lng !== "number") {
    if (liveMarkers[uid]) {
      map.removeLayer(liveMarkers[uid]);
      delete liveMarkers[uid];
    }
    return;
  }

  // 👇 SKRYJ MARKER, pokud má uživatel hidden = true
  if (data.hidden === true) {
    if (liveMarkers[uid]) {
      map.removeLayer(liveMarkers[uid]);
      delete liveMarkers[uid];
    }
    if (window.miniPopups && window.miniPopups[uid]) {
      map.removeLayer(window.miniPopups[uid]);
      delete window.miniPopups[uid];
    }
    return; // ⛔ Nepokračuj ve vykreslování tohoto uživatele
  }

  // === Výpočet stavu "Live" nebo "last seen" ===
  const firstName = (data.displayName || "User").split(" ")[0];
let statusText = "Live";
let statusClass = "live";

// 🧠 Lokální priorita pro aktuálního uživatele
const isCurrentUser = auth.currentUser && auth.currentUser.uid === uid;
if (isCurrentUser && liveWatchId !== null) {
  statusText = "Live";
  statusClass = "live";
  data.isLive = true; // 🧩 zajistí, že zoom nebo refresh nevrátí "Just now"
} else if (!data.isLive && data.lastSeen?.toDate) {
  const diffMs = Date.now() - data.lastSeen.toDate().getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 🕒 Automaticky skryj uživatele po 48 hodinách neaktivity
  if (diffHours >= 48) {
    // ✅ Odstraň marker z mapy (uživatel starší než 48h)
    if (liveMarkers[uid]) {
      map.removeLayer(liveMarkers[uid]);
      delete liveMarkers[uid];
    }
    if (window.miniPopups && window.miniPopups[uid]) {
      map.removeLayer(window.miniPopups[uid]);
      delete window.miniPopups[uid];
    }
    return; // ⛔ Přeskoč další vykreslování tohoto uživatele
  }

  // 🔹 Jinak pokračuj normálně – vypočítej čas od poslední aktivity
  if (diffMins < 1) statusText = "Just now";
  else if (diffMins < 60) statusText = `${diffMins} min`;
  else if (diffHours < 24) statusText = `${diffHours} h`;
  else statusText = `${diffDays} day${diffDays > 1 ? "s" : ""}`;

  statusClass = "inactive";
}

  // === Ikona uživatele ===
  const icon = L.icon({
  iconUrl: avatarUrl,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -46],
  className: data.isLive ? "user-icon live-outline" : "user-icon"
});


  // === Nový nebo aktualizovaný marker ===
  if (!liveMarkers[uid]) {
    const m = L.marker([lat, lng], { icon }).addTo(map);

   // 🧩 Mini-popup (jméno + status) – opravuje Live → Just now bug
const isCurrentUser = auth.currentUser && auth.currentUser.uid === uid;
let miniStatusText = statusText;
let miniStatusClass = statusClass;

// ✅ Pokud je to aktuální uživatel a sdílí, nikdy nepřepiš na "Just now"
if (isCurrentUser && liveWatchId !== null) {
  miniStatusText = "Live";
  miniStatusClass = "live";
}

const miniPopup = L.divIcon({
  className: "mini-popup",
  html: `
    <div class="mini-popup-inner">
      <span class="mini-popup-name">${firstName}</span>
      <span class="mini-popup-status ${miniStatusClass}">${miniStatusText}</span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, -1],
});

if (window.miniPopups && window.miniPopups[uid]) {
  map.removeLayer(window.miniPopups[uid]);
  delete window.miniPopups[uid];
}

// === Mini marker (pro bublinu) — vždy viditelný ===
const miniMarker = L.marker([lat, lng], { icon: miniPopup, interactive: false }).addTo(map);
if (!window.miniPopups) window.miniPopups = {};
window.miniPopups[uid] = miniMarker;



    // === Kliknutí otevře panel ===
    m.on("click", () => {
      const panel = document.getElementById("userDetailPanel");
      const content = document.getElementById("userDetailContent");

      content.innerHTML = `
        <div class="panel-header">
          <img class="popup-avatar" src="${data.photoURL || 'https://www.gravatar.com/avatar?d=mp'}" alt="Avatar">
          <div class="panel-userinfo">
            <div class="panel-name-row">
              <strong>${data.displayName || 'Unknown'}</strong>
              ${data.verified ? '<span class="badge verified-badge"><img class="verified-icon" src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ec104bbf6183f2f84c71b7_verified.png" alt="Verified" />Verified</span>' : ''}
              ${data.ranger ? '<span class="badge ranger-badge"><img class="ranger-icon" src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68fba159091b4ac6d4781634_ranger%20(1).png" alt="Ranger" />Ranger</span>' : ''}
            </div>
            ${data.instagram ? `<div class="popup-instagram"><a href="https://instagram.com/${data.instagram.replace('@','')}" target="_blank" class="popup-instagram-link">@${data.instagram.replace('@','')}</a></div>` : ''}
          </div>
        </div>

        <div class="user-section">
          <h3>Bio</h3>
          <p>${data.bio || 'No bio provided.'}</p>
        </div>

        <div class="user-section">
          <h3>Vehicle</h3>
          <p>${data.vehicle || 'No vehicle info.'}</p>
        </div>

        <div class="user-section">
          <h3>Vehicle photo</h3>
          <div id="userVehiclePhotoWrapper">
            ${data.vehiclePhotoURL && data.vehiclePhotoURL.trim()
              ? `<div id="userVehiclePhotoPlaceholder" style="background:#f4f4f4; border-radius:12px; height:160px; display:none; justify-content:center; align-items:center; color:#888;">No vehicle photo</div><img id="userVehiclePhoto" class="show" src="${data.vehiclePhotoURL}" alt="Vehicle photo" onerror="this.style.display='none'; document.getElementById('userVehiclePhotoPlaceholder').style.display='flex';" />`
              : `<div style="background:#f4f4f4; border-radius:12px; height:160px; display:flex; justify-content:center; align-items:center; color:#888;">No vehicle photo</div>`
            }
          </div>
        </div>
      `;

      panel.style.display = "block";
      panel.classList.add("active");
    });

    map.on("click", () => {
      document.getElementById("userDetailPanel").classList.remove("active");
    });

    liveMarkers[uid] = m;
  } else {
  liveMarkers[uid].setLatLng([lat, lng]);
  if (window.miniPopups && window.miniPopups[uid]) {
    window.miniPopups[uid].setLatLng([lat, lng]);
  }
}
}
    });
  });
}

// === 🧩 Sleduj změny v users, aby se People panel aktualizoval ===
db.collection("users").onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    const uid = change.doc.id;
    const data = change.doc.data();

    // Pokud má uživatel marker – aktualizuj jeho fotku
    if (liveMarkers[uid]) {
      const newPhoto = data.photoURL || "https://www.gravatar.com/avatar?d=mp";
      const newIcon = L.icon({
        iconUrl: newPhoto,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        className: "user-icon live-outline"
      });
      liveMarkers[uid].setIcon(newIcon);
    }

    // Aktualizuj People panel (pokud je otevřený)
    const panel = document.getElementById("userDetailPanel");
    if (panel && panel.style.display !== "none" && panel.dataset.uid === uid) {
      document.getElementById("userBioText").textContent = data.bio || "";
      document.getElementById("userVehicleText").textContent = data.vehicle || "";

      // ✅ Zobraz vehicle photo nebo placeholder
      const vehicleImg = document.getElementById("userVehiclePhoto");
      const vehicleImgPlaceholder = document.getElementById("userVehiclePhotoPlaceholder");
      if (data.vehiclePhotoURL && data.vehiclePhotoURL.trim()) {
        vehicleImg.src = data.vehiclePhotoURL;
        vehicleImg.style.display = "block";
        if (vehicleImgPlaceholder) vehicleImgPlaceholder.style.display = "none";
      } else {
        vehicleImg.style.display = "none";
        if (vehicleImgPlaceholder) vehicleImgPlaceholder.style.display = "flex";
      }
    }
  });
});


    async function startLive() {
      const user = auth.currentUser;
      if (!user) return;
      const userDocRef = db.collection("liveLocations").doc(user.uid);

      // ✅ Nejdřív získej GPS polohu, pak nastav isLive
      let isFirstPosition = true;

      liveWatchId = navigator.geolocation.watchPosition(async pos => {
        if (!pos.coords) {
          console.warn("No coords returned from geolocation.");
          return;
        }

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // ✅ Na první pozici nastav isLive + všechna data najednou
          if (isFirstPosition) {
            isFirstPosition = false;

            // Získej user data pro verified a ranger badges
            const userDoc = await db.collection("users").doc(user.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};

            await userDocRef.set({
              lat,
              lng,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              bio: userData.bio || "",
              vehicle: userData.vehicle || "",
              vehiclePhotoURL: userData.vehiclePhotoURL || "",
              instagram: userData.instagram || "",
              verified: userData.verified || false,
              ranger: userData.ranger || false,
              isLive: true,
              lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 🔁 Refresh aby se marker okamžitě zobrazil
            setupLiveLocations();
          } else {
            // ✅ Při dalších updatech jen GPS souřadnice
            await userDocRef.set({
              lat,
              lng,
              lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
        } catch (err) {
          console.error("Failed to update live location:", err);
        }

      }, err => {
        console.error("Geolocation error:", err);
        alert("Unable to access your location. Please enable GPS and try again.");
      }, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 20000
      });
    }

    async function stopLive() {
  const user = auth.currentUser;
  if (!user) return;

  if (liveWatchId !== null) {
    navigator.geolocation.clearWatch(liveWatchId);
    liveWatchId = null;
  }

  const userDocRef = db.collection("liveLocations").doc(user.uid);

  // ✅ Aktualizace: přepíšeme isLive = false a uložíme timestamp
  await userDocRef.set({
    isLive: false,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // ✅ Okamžitě aktualizujeme marker i bublinu v UI
  if (liveMarkers[user.uid]) {
    map.removeLayer(liveMarkers[user.uid]);
    delete liveMarkers[user.uid];
  }
  if (window.miniPopups && window.miniPopups[user.uid]) {
    map.removeLayer(window.miniPopups[user.uid]);
    delete window.miniPopups[user.uid];
  }
}


    // === Chat Send Button ===
// 🧠 Uchovává aktuálně otevřenou chatovou skupinu (výchozí je "general")
let currentGroup = localStorage.getItem("selectedChatGroup") || "general";

// 🧩 Kliknutí na jednotlivé chat-group karty
document.querySelectorAll(".chat-group").forEach(btn => {
  btn.addEventListener("click", () => {
    const groupId = btn.dataset.group || "general";
    currentGroup = groupId; // ✅ nastaví správnou skupinu
    localStorage.setItem("selectedChatGroup", groupId); // uloží pro refresh

    // Změní titulek chatu
    const chatGroupTitle = document.getElementById("chatGroupTitle");
    if (chatGroupTitle) {
      chatGroupTitle.textContent = btn.querySelector("span").textContent;
    }

    // Načti zprávy pro danou skupinu
    loadMessages(groupId);

    // Přepni z přehledu skupin do samotného chatu
    document.getElementById("chatGroups").style.display = "none";
    document.getElementById("chat").style.display = "flex";
    document.getElementById("form").style.display = "flex";
    document.getElementById("chatHeader").style.display = "flex";
  });
});


// === Chat Send Button ===
sendBtn.onclick = async () => {
  const txt = msgInput.value.trim();
  const file = imageInput.files[0];
  const user = auth.currentUser;
  if (!user) {
    console.warn("⚠️ No user logged in, cannot send message");
    return;
  }

  // ✅ Check email verification status
  if (!user.emailVerified) {
    alert("Please verify your email address before sending messages. Check your inbox for the verification email.");
    return;
  }

  if (!txt && !file) {
    console.warn("⚠️ Empty message or file");
    return;
  }

  try {
    let userDoc = await db.collection("users").doc(user.uid).get();
    let verified = userDoc.exists && userDoc.data().verified === true;
    let ranger = userDoc.exists && userDoc.data().ranger === true;

    let imageUrl = "";
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image too large. Max 2 MB.");
        return;
      }
      const imgRef = storage.ref(`chatImages/${user.uid}/${Date.now()}_${file.name}`);
      await imgRef.put(file);
      imageUrl = await imgRef.getDownloadURL();
    }

    const userData = userDoc.exists ? userDoc.data() : {};

    // ✅ Ulož do správné kolekce podle skupiny
    await db.collection(`messages_${currentGroup}`).add({
      text: txt || "",
      imageUrl: imageUrl || "",
      uid: user.uid,
      displayName: user.displayName || "User",
      photoURL: user.photoURL || "",
      verified: userData.verified || false,
      ranger: userData.ranger || false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 🧹 Vyčištění polí
    msgInput.value = "";
    imageInput.value = "";
    uploadInfo.style.display = "none";
    uploadText.textContent = "";

    console.log(`✅ Message sent to messages_${currentGroup}`);
  } catch (err) {
    console.error("❌ Error sending message:", err);
    alert("Failed to send message. Check console for details.");
  }
};



  async function setupGoLiveButton() {
  const shareBtn = document.getElementById("shareLocationBtn");
  if (!shareBtn) return;

  // 🩹 FIX: Odeber staré event listenery při opětovném přihlášení
  const newShareBtn = shareBtn.cloneNode(true);
  shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);

  // Potom používej `newShareBtn` místo `shareBtn` dál v celé funkci:
  const btn = newShareBtn;

    // ✅ Zkontroluj stav z Firebase při načtení a podle něj nastav tlačítko
  const user = auth.currentUser;
  if (user) {
    const liveDoc = await db.collection("liveLocations").doc(user.uid).get();
    if (liveDoc.exists && liveDoc.data().isLive) {
      btn.classList.add("active");
      btn.innerHTML = `
        <img src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed633027976d278ff80bba_live-focus.png"
             alt="Live Icon" class="live-icon" />
        Stop Sharing
      `;
      // ✅ Znovu spusť update loop (aby pokračovalo sledování polohy)
      startLive();
    } else {
      btn.classList.remove("active");
      btn.innerHTML = `
        <img src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed62ac5fa9fb8e0fe1bf96_live.png"
             alt="Live Icon" class="live-icon" />
        Share Location
      `;
    }
  }


  btn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (liveWatchId === null) {
      // === START SHARING ===
      // startLive() čeká na GPS pozici a pak nastaví isLive + všechna data
      await startLive();

      btn.classList.add("active");
      btn.innerHTML = `
        <img src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed633027976d278ff80bba_live-focus.png"
             alt="Live Icon" class="live-icon" />
        Stop Sharing
      `;

    } else {
      // === STOP SHARING ===
      await stopLive();
      btn.classList.remove("active");
      btn.innerHTML = `
  <img src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed62ac5fa9fb8e0fe1bf96_live.png"
       alt="Live Icon" class="live-icon" />
  Share Location
`;

      // ✅ Smazání markerů a bublin
      Object.values(liveMarkers).forEach(m => map.removeLayer(m));
      for (const uid in liveMarkers) delete liveMarkers[uid];

      if (window.miniPopups) {
        Object.values(window.miniPopups).forEach(p => map.removeLayer(p));
        window.miniPopups = {};
      }

      // ✅ Refresh mapy po 0.8 s (aktualizace z Firestore)
      setTimeout(() => {
        setupLiveLocations();
      }, 800);
    }
  });
}

function refreshChatAvatars() {
  const messages = document.querySelectorAll(".msg.other, .msg.me");

  messages.forEach(async msgEl => {
    const uid = msgEl.getAttribute("data-uid");
    if (!uid) return;

    try {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const avatarImg = msgEl.querySelector(".avatar");
        if (avatarImg && userData.photoURL) {
          avatarImg.src = userData.photoURL;
        }
      }
    } catch (err) {
      console.error("Error refreshing avatar for user:", uid, err);
    }
  });
}


// === Visibility toggle ===
const visibilityBtnEl = document.getElementById("visibilityBtn");
if (visibilityBtnEl) {
  let isVisible = true;

    // 🟢 Při načtení zkontroluj stav hidden z Firestore a uprav ikonku
  (async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = db.collection("liveLocations").doc(user.uid);
    const liveDoc = await userDocRef.get();

    if (liveDoc.exists && liveDoc.data().hidden === true) {
      isVisible = false;
      document.getElementById("visibilityIcon").src =
        "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f6a54af63bb9cb97f07730_visibility.png"; // přeškrtnuté oko
    } else {
      isVisible = true;
      document.getElementById("visibilityIcon").src =
        "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f6a54a2914de7af9a65d54_blind.png"; // otevřené oko
    }
  })();

  visibilityBtnEl.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = db.collection("liveLocations").doc(user.uid);
    const liveDoc = await userDocRef.get();
    const isLive = liveDoc.exists && liveDoc.data().isLive === true;

    // ❗ Visibility lze měnit jen když NESDÍLÍM polohu
    if (isLive) {
      alert("You can’t change visibility while sharing location. Stop Sharing first.");
      return;
    }

    if (isVisible) {
      // 🔴 Skryj mojí ikonu lokálně + ulož flag
      if (liveMarkers[user.uid]) map.removeLayer(liveMarkers[user.uid]);
      if (window.miniPopups && window.miniPopups[user.uid]) map.removeLayer(window.miniPopups[user.uid]);

      document.getElementById("visibilityIcon").src =
        "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f6a54af63bb9cb97f07730_visibility.png";

      await userDocRef.set({ hidden: true }, { merge: true });
      isVisible = false;
    } else {
      // 🟢 Zobraz zpátky (načti markery znovu)
      await userDocRef.set({ hidden: false }, { merge: true });

      // reinit markerů (používáš onSnapshot -> stačí re-call utilitky)
      setupLiveLocations();

      document.getElementById("visibilityIcon").src =
        "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f6a54a2914de7af9a65d54_blind.png";

      isVisible = true;
    }
  });
}



   function loadMessages(group = "general") {
  console.log("Loading messages for group:", group);

  const loader = document.getElementById("globalLoader");
  if (loader) loader.style.display = "flex"; // 🧭 Zobraz loader hned

  // 🔁 Pokud už běžel nějaký listener, vypneme ho
  if (window.currentMessagesUnsub) {
    window.currentMessagesUnsub();
  }

  // 📂 Kolekce podle skupiny
  const groupCollection = db.collection(`messages_${group}`);

  // 💬 Načti zprávy
  window.currentMessagesUnsub = groupCollection
    .orderBy("createdAt", "asc")
    .onSnapshot(snapshot => {
      chatDiv.innerHTML = "";

      snapshot.forEach(doc => {
      // 🔽 Okamžitý skok na konec bez animace
        requestAnimationFrame(() => {
          chatDiv.scrollTop = chatDiv.scrollHeight;
        }); 
        const msg = doc.data();
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("msg");

        // 🔥 Rozlišení mých zpráv
        if (msg.uid === auth.currentUser?.uid) {
          msgDiv.classList.add("me");
        } else {
          msgDiv.classList.add("other");
        }

        // 🧠 Důležité – přidáme UID jako identifikátor
        msgDiv.setAttribute("data-uid", msg.uid);

        const avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = msg.photoURL || "https://www.gravatar.com/avatar?d=mp";
        avatar.alt = "avatar";
        avatar.setAttribute("data-uid", msg.uid);

        const bubble = document.createElement("div");
        bubble.className = "bubble";
        let content = "";
        if (msg.text) content += `<div>${msg.text}</div>`;
        if (msg.imageUrl) {
          content += `
            <img src="${msg.imageUrl}" 
                 alt="Sent image" 
                 class="chat-image"
                 style="margin-top:6px; max-width:200px; border-radius:10px; display:block; cursor:pointer;">
          `;
        }

        // 🕒 Funkce pro formátování času jako 6h, 1d, 2w, ...
function getRelativeTime(timestamp) {
  if (!timestamp) return "";
  const now = new Date();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  const diffW = Math.floor(diffD / 7);

  if (diffMin < 1) return "now";
  if (diffH < 1) return `${diffMin}m`;
  if (diffD < 1) return `${diffH}h`;
  if (diffW < 1) return `${diffD}d`;
  return `${diffW}w`;
}

// 🧩 uvnitř renderu zpráv
const timeText = msg.createdAt?.toDate ? getRelativeTime(msg.createdAt.toDate()) : "";

bubble.innerHTML = `
  <div class="meta">
    ${msg.displayName || "Unknown"}
    ${msg.verified ? '<span class="badge verified-badge"><img src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ec104bbf6183f2f84c71b7_verified.png" alt="Verified" class="verified-icon" />Verified</span>' : ''}
    ${msg.ranger ? '<span class="badge ranger-badge"><img src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68fba159091b4ac6d4781634_ranger%20(1).png" alt="Ranger" class="ranger-icon" />Ranger</span>' : ''}
    <span class="msg-time">${timeText}</span>
  </div>
  ${content}
`;


msgDiv.appendChild(avatar);
msgDiv.appendChild(bubble);
chatDiv.appendChild(msgDiv);

      });

      // 🧠 Aktualizuj avatary po každém snapshotu
      refreshChatAvatars();

      // 🔥 Scrolluj dolů po načtení
      setTimeout(() => {
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }, 50);

      // ✅ Skryj loader po načtení zpráv
      if (loader) loader.style.display = "none";
    }, err => {
      console.error("❌ Error loading messages:", err);
      if (loader) loader.style.display = "none";
    });
}



// === Galerie obrázku v chatu ===
const imageModal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeImageModal = document.getElementById("closeImageModal");

// Kliknutí na obrázek v chatu
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("chat-image")) {
    modalImg.src = e.target.src;
    imageModal.style.display = "flex";
  }
});

// Zavření galerie
closeImageModal.addEventListener("click", () => {
  imageModal.style.display = "none";
  modalImg.src = "";
});

// Zavření kliknutím mimo obrázek
imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = "none";
    modalImg.src = "";
  }
});


// Explore map now loaded via iframe from explore.html


    function closeAccessModal() {
      document.getElementById("accessDeniedModal").style.display = "none";

      // Přepni na login formulář po zavření modalu
      document.getElementById("emailLoginForm").style.display = "flex";
      document.getElementById("signupForm").style.display = "none";
      document.getElementById("toSignup").style.display = "block";
      document.getElementById("toLogin").style.display = "none";
      document.getElementById("authTitle").textContent = "Log in";
    }

    // === SAVE PROFILE HANDLER ===
saveProfileBtn.addEventListener("click", async () => {

  const user = auth.currentUser;
  if (!user) return;

  saveProfileBtn.disabled = true;                
  saveProfileBtn.textContent = "Saving...";      

  const displayName = displayNameInput.value.trim();
  const bio = document.getElementById("bioInput").value.trim();
  const instagram = document.getElementById("instagramInput").value.trim();
  const vehicle = document.getElementById("vehicleSelect").value;
  const avatarFile = avatarInput.files[0];
  const vehicleFile = vehiclePhotoInput.files[0];
  const userRef = db.collection("users").doc(user.uid);

  try {
    // Načti aktuální data (abychom porovnali změny)
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};

    let photoURL = user.photoURL || "";
    let vehiclePhotoURL = userData.vehiclePhotoURL || "";

    // === Upload avatar ===
    if (avatarFile) {
      const avatarRef = storage.ref(`avatars/${user.uid}`);
      await avatarRef.put(avatarFile);
      photoURL = await avatarRef.getDownloadURL();
      await user.updateProfile({ photoURL });
    }

    // === Upload vehicle photo ===
    if (vehicleFile && vehicleFile.name) {
      const fileName = `${Date.now()}_${vehicleFile.name}`;
      const vehicleRef = storage.ref(`vehicles/${user.uid}/${fileName}`);
      const snapshot = await vehicleRef.put(vehicleFile);
      vehiclePhotoURL = await snapshot.ref.getDownloadURL();
    }

    // === ⚡ SAFE GUARD – žádné "file://" a žádné přepisování prázdnými hodnotami ===
    // Pokud preview má src a je zobrazený, použij ho
    if (vehiclePhotoPreview.src && vehiclePhotoPreview.src.startsWith("https://") && vehiclePhotoPreview.style.display !== "none") {
      vehiclePhotoURL = vehiclePhotoPreview.src;
    } else if (vehiclePhotoPreview.style.display === "none" && !vehicleFile) {
      // Pokud je preview schovaný a nebyla nahrána nová fotka, použij prázdný string (delete)
      vehiclePhotoURL = "";
    }

    // 🔍 Zjisti, jestli se něco skutečně změnilo
    const hasChanges =
      displayName !== (userData.displayName || "") ||
      bio !== (userData.bio || "") ||
      instagram !== (userData.instagram || "") ||
      vehicle !== (userData.vehicle || "") ||
      photoURL !== (userData.photoURL || "") ||
      vehiclePhotoURL !== (userData.vehiclePhotoURL || "");

    if (!hasChanges) {
      console.log("ℹ️ No changes to save.");
      alert("No changes detected.");
      saveProfileBtn.disabled = false;
      saveProfileBtn.textContent = "Save";
      return;
    }

    // === SAVE TO FIRESTORE ===
    await userRef.set({
      displayName,
      photoURL,
      vehicle,
      bio,
      instagram,
      vehiclePhotoURL
    }, { merge: true });

    // === OKAMŽITÁ AKTUALIZACE UI ===
    await user.updateProfile({
      displayName,
      photoURL: photoURL || user.photoURL || ""
    });

    const headerName = document.getElementById("headerName");
    if (headerName) {
      const firstName = (displayName || "User").split(" ")[0];
      headerName.textContent = firstName;
    }

    const profileIcon = document.getElementById("profileIcon");
    const defaultPhoto = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68f42acf3f8263cdf39637b0_unknown.jpg";
    if (profileIcon) {
      profileIcon.src = photoURL || defaultPhoto;
    }

    if (currentAvatar) {
      currentAvatar.src = photoURL || defaultPhoto;
    }

    // ✅ Aktualizuj liveLocations jen když UŽIVATEL REÁLNĚ sdílí polohu
const liveRef = db.collection("liveLocations").doc(user.uid);
const liveSnap = await liveRef.get();

// 🧠 Aktualizuj nebo vytvoř liveLocations záznam, i když uživatel není Live
if (!liveSnap.exists) {
  // nový uživatel — vytvoř dokument
  await liveRef.set({
    displayName,
    photoURL,
    vehicle,
    bio,
    instagram,
    vehiclePhotoURL,
    isLive: false,
    hidden: false,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  });
} else {
  // už existuje — aktualizuj data
  // ✅ Bezpečný fallback – zajistí, že liveLocations má vždy platná data
const safePhoto = photoURL || "https://www.gravatar.com/avatar?d=mp";
const safeVehiclePhoto = vehiclePhotoURL || "";

await liveRef.set({
  displayName: displayName || "User",
  photoURL: safePhoto,
  vehicle: vehicle || "",
  bio: bio || "",
  instagram: instagram || "",
  vehiclePhotoURL: safeVehiclePhoto,
  lastSeen: firebase.firestore.FieldValue.serverTimestamp()
}, { merge: true });

}

// pokud není isLive:true, NIC do liveLocations neukládej


    alert("✅ Profile saved!");
    profileEditor.style.display = "none";

  } catch (err) {
    console.error("❌ Error saving profile:", err);
    alert("Failed to save profile. Try again later.");
  } finally {
    saveProfileBtn.disabled = false;             
    saveProfileBtn.textContent = "Save";         
  }

  // ✅ Po uložení profilu proveď refresh s loaderem
  const loader = document.getElementById("globalLoader");
  if (loader) loader.style.display = "flex"; 
  setTimeout(() => {
    window.location.reload();
  }, 1000);

 // 🔄 Sync do liveLocations (aby se panel People hned aktualizoval)
try {
  const liveRef = db.collection("liveLocations").doc(auth.currentUser.uid);
  await liveRef.set({
    bio: updatedData.bio || "",
    vehicle: updatedData.vehicle || "",
    instagram: updatedData.instagram || "",
    photoURL: updatedData.photoURL || "",
    vehiclePhotoURL: updatedData.vehiclePhotoURL || "",
    displayName: updatedData.displayName || auth.currentUser.displayName || "User"
  }, { merge: true });
  console.log("✅ LiveLocations synced after profile save");
} catch (err) {
  console.error("❌ Failed to sync liveLocations:", err);
}
 

});

document.getElementById("closeProfileBtn").addEventListener("click", () => {
  profileEditor.style.display = "none";
  refreshChatAvatars(); 
});


// === DELETE AVATAR FUNCTION ===
document.getElementById("deleteAvatarBtn").addEventListener("click", async () => {
  const confirmDelete = confirm("Are you sure you want to delete this photo?");
  if (!confirmDelete) return;

  const user = auth.currentUser;
  if (!user) return alert("Not logged in");

  const defaultAvatar = "https://www.gravatar.com/avatar?d=mp";

  // 🔄 Aktualizace UI
  const currentAvatar = document.getElementById("currentAvatar");
  const profileIcon = document.getElementById("profileIcon");
  if (currentAvatar) currentAvatar.src = defaultAvatar;
  if (profileIcon) profileIcon.src = defaultAvatar;

  try {
    // 🔄 Aktualizace ve Firestore
    await db.collection("users").doc(user.uid).update({
      photoURL: defaultAvatar
    });

    // 🔄 Aktualizace v Auth profilu
    await user.updateProfile({ photoURL: defaultAvatar });

    // 🔄 Aktualizace i v liveLocations (aby se přepsala fotka i v People)
const liveDocRef = db.collection("liveLocations").doc(user.uid);
await liveDocRef.set(
  {
    photoURL: defaultAvatar
  },
  { merge: true }
);

// 🔁 Okamžitý refresh markeru na mapě (pokud existuje)
if (liveMarkers[user.uid]) {
  const icon = L.icon({
    iconUrl: defaultAvatar,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    className: "user-icon live-outline"
  });
  liveMarkers[user.uid].setIcon(icon);
}


    alert("✅ Profile photo deleted.");
  } catch (err) {
    console.error("Error deleting avatar:", err);
    alert("❌ Failed to delete photo. Try again later.");
  }

  // 🔄 Aktualizuj i liveLocations (aby se změna projevila hned v People sekci)
try {
  const liveRef = db.collection("liveLocations").doc(user.uid);
  await liveRef.set(
    {
      photoURL: defaultAvatar
    },
    { merge: true }
  );

  // ✅ Okamžitý update markeru bez nutnosti refreshu
  if (liveMarkers[user.uid]) {
    const newIcon = L.icon({
      iconUrl: defaultAvatar,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      className: "user-icon live-outline"
    });
    liveMarkers[user.uid].setIcon(newIcon);
  }
} catch (err) {
  console.error("Failed to update live marker photo:", err);
}
});


// === DELETE VEHICLE PHOTO FUNCTION ===
document.getElementById("deleteVehiclePhotoBtn").addEventListener("click", async () => {
  const confirmDelete = confirm("Are you sure you want to delete this vehicle photo?");
  if (!confirmDelete) return;

  const user = auth.currentUser;
  if (!user) return alert("Not logged in");

  // 🔄 Aktualizace UI
  const vehiclePhotoPreview = document.getElementById("vehiclePhotoPreview");
  const vehiclePhotoPlaceholder = document.getElementById("vehiclePhotoPlaceholder");
  const deleteVehiclePhotoBtn = document.getElementById("deleteVehiclePhotoBtn");

  if (vehiclePhotoPreview) {
    vehiclePhotoPreview.style.display = "none";
    vehiclePhotoPreview.src = ""; // ⚡ Vymazat src, aby Save nezačal používat starou URL
  }
  if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "flex";
  if (deleteVehiclePhotoBtn) deleteVehiclePhotoBtn.style.display = "none";

  try {
    // 🔄 Aktualizace ve Firestore
    await db.collection("users").doc(user.uid).update({
      vehiclePhotoURL: ""
    });

    // 🔄 Aktualizace i v liveLocations (aby se změna projevila v People sekci)
    const liveDocRef = db.collection("liveLocations").doc(user.uid);
    await liveDocRef.set(
      {
        vehiclePhotoURL: ""
      },
      { merge: true }
    );

    // 🔁 Aktualizace panelu pokud je otevřený
    const panel = document.getElementById("userDetailPanel");
    if (panel && panel.style.display !== "none" && panel.dataset.uid === user.uid) {
      const vehicleImg = document.getElementById("userVehiclePhoto");
      const vehicleImgPlaceholder = document.getElementById("userVehiclePhotoPlaceholder");
      if (vehicleImg) vehicleImg.style.display = "none";
      if (vehicleImgPlaceholder) vehicleImgPlaceholder.style.display = "flex";
    }

    alert("✅ Vehicle photo deleted.");
  } catch (err) {
    console.error("Error deleting vehicle photo:", err);
    alert("❌ Failed to delete photo. Try again later.");
  }
});


document.getElementById("closeProfileBtn").addEventListener("click", () => {
  const profileEditor = document.getElementById("profileEditor");
  profileEditor.style.display = "none";
});


// === Aktualizace markeru uživatele na mapě ===
function updateUserMarker(data) {
  if (!window.liveMarkers || !map) return;

  const existing = window.liveMarkers[data.uid];
  if (!existing) return;

  const icon = L.icon({
  iconUrl: data.photoURL || "https://www.gravatar.com/avatar?d=mp",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -42],
  className: "user-icon",
});

  existing.setIcon(icon);

  const vehicleText = data.vehicle ? ` (${data.vehicle})` : "";
  const gpsText =
  data.lat && data.lng
    ? `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`
    : "No GPS data";

const popupHTML = `
  <div class="popup-content">
    <strong>${data.displayName || "Unknown User"}</strong>
    <div class="gps">📍 ${gpsText}</div>
    <div class="vehicle">🚙 ${data.vehicle || "No vehicle info"}</div>
  </div>
`;

existing.bindPopup(popupHTML, { className: "custom-popup" });

}

  // === Ikony ===
// 🏠 Home
const homeIconDefault = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/690214cdc412ca539d7fcdfe_home-button.png";
const homeIconActive  = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/690214cdec9d2efab9720566_home-focus.png";

const chatIconDefault = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed60dbeff425a3e7d0d35e_paper-plane.png";
const chatIconActive  = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed60e5e6a6b87e493e45db_paper-plane-focus.png";

const liveIconDefault = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed62ac5fa9fb8e0fe1bf96_live.png";
const liveIconActive  = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed633027976d278ff80bba_live-focus.png";

// 🆕 Explore (nová mapa s froady)
const exploreIconDefault = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed640a5b1f7f0d0f842643_map%20(3).png";
const exploreIconActive  = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed64a21a1343f06a3152d5_map-focus.png";

// 🧭 Community (přejmenovaná původní mapa)
const communityIconDefault = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68efa731bab109784845d316_people.png";
const communityIconActive  = "https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68efa7311faefa85ba34ed0a_people-focus.png";

document.querySelectorAll('.footer-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.footer-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;

    // 🧩 Když se přepíná přes footer, schovej chat header
const chatHeader = document.getElementById("chatHeader");
if (tab !== "chat" && chatHeader) {
  chatHeader.style.display = "none";
}

// ✅ Hide email verification banner when not in chat section
const emailBanner = document.getElementById("emailVerificationBanner");
if (tab !== "chat" && emailBanner) {
  emailBanner.style.display = "none";
}


    // Přepínání ikon (máš je nadefinované výše)
    document.querySelector('.home-btn .home-icon').src =
      (tab === "home") ? homeIconActive : homeIconDefault;
    document.querySelector('.explore-btn .explore-icon').src =
      (tab === "explore") ? exploreIconActive : exploreIconDefault;
    document.querySelector('.map-btn .map-icon').src =
      (tab === "map") ? communityIconActive : communityIconDefault;
    document.querySelector('.chat-btn .chat-icon').src =
      (tab === "chat") ? chatIconActive : chatIconDefault;

    // Zobrazení sekcí
    document.getElementById('homeSection').style.display = (tab === "home") ? "block" : "none";
    document.getElementById('exploreMap').style.display = (tab === "explore") ? "block" : "none";
    document.getElementById('mapContainer').style.display = (tab === "map") ? "block" : "none";
    document.getElementById('chat').style.display = (tab === "chat") ? "flex" : "none";
    document.getElementById('form').style.display = (tab === "chat") ? "flex" : "none";

    // Ensure chat groups is hidden when not on chat tab
    const chatGroups = document.getElementById('chatGroups');
    if (chatGroups && tab !== "chat") {
      chatGroups.style.display = "none";
    }

    // Initialize FAQ when home tab is shown
    if (tab === "home") {
      setTimeout(() => {
        initializeFAQ();
        initJournalSlider();
      }, 50);
      // ✅ Update road status when switching to home tab
      setTimeout(() => updateRoadStatus(), 100);
    }

    // Explore map runs in iframe - no initialization needed here

    // ✅ Oprava Leaflet mapy po přepnutí na "People"
if (tab === "map") {
  const loader = document.getElementById("globalLoader");
  loader.style.display = "flex";
  setTimeout(() => {
    if (window.map && typeof map.invalidateSize === "function") {
      map.invalidateSize();
    }
    loader.style.display = "none";
  }, 400);
}


    // === Chat Groups visibility ===
    if (tab === "chat") {
  // 🧩 pokaždé, když kliknu na Chat ve footeru → vždy čistý seznam skupin
  chatGroups.style.display = "flex";
  chatDiv.style.display = "none";
  formEl.style.display = "none";

  // 🔒 schovej případný header „← General“
  const chatHeader = document.getElementById("chatHeader");
  if (chatHeader) chatHeader.style.display = "none";

  // 🧹 smaž uloženou skupinu, aby se po reloadu nezobrazila General
  localStorage.removeItem("selectedChatGroup");
} else {
  chatGroups.style.display = "none";
}

    // === Výběr chat group ===
    document.querySelectorAll(".chat-group").forEach(group => {
  group.addEventListener("click", async () => {
    chatGroups.style.display = "none";
    chatDiv.style.display = "block";
    formEl.style.display = "flex";
    chatHeader.style.display = "flex";
    chatGroupTitle.textContent = group.querySelector("span").textContent;
    backBtn.style.display = "inline-block";

    // ✅ Show/hide email verification banner
    const emailBanner = document.getElementById("emailVerificationBanner");
    const chatContainer = document.getElementById("chat");
    if (!window.isEmailVerified) {
      if (emailBanner) emailBanner.style.display = "block";
      if (chatContainer) chatContainer.classList.add("with-banner");
      // Disable message input for unverified users
      const msgInput = document.getElementById("msgInput");
      const sendBtn = document.getElementById("sendBtn");
      if (msgInput) msgInput.disabled = true;
      if (sendBtn) sendBtn.disabled = true;
    } else {
      if (emailBanner) emailBanner.style.display = "none";
      if (chatContainer) chatContainer.classList.remove("with-banner");
      // Enable message input for verified users
      const msgInput = document.getElementById("msgInput");
      const sendBtn = document.getElementById("sendBtn");
      if (msgInput) msgInput.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
    }

    // 🧩 Načti zprávy
    await loadMessages(group.dataset.group);

    // 🔽 Automaticky skoč na konec (bez animace)
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
});


    // 🧭 Back button – návrat z chatu do seznamu skupin
    const backBtn = document.getElementById("backToGroupsBtn");

    document.querySelectorAll(".chat-group").forEach(group => {
      group.addEventListener("click", () => {
        backBtn.style.display = "block"; // zobraz tlačítko zpět
      });
    });

    backBtn.addEventListener("click", () => {
  chatDiv.style.display = "none";
  formEl.style.display = "none";
  chatGroups.style.display = "flex";
  backBtn.style.display = "none";

  // 🧩 Skryj i header (← General)
  const chatHeader = document.getElementById("chatHeader");
  if (chatHeader) chatHeader.style.display = "none";

  // ✅ Hide email verification banner when going back to chat groups
  const emailBanner = document.getElementById("emailVerificationBanner");
  if (emailBanner) emailBanner.style.display = "none";
});


    // Tlačítka: znovu si je vezmu ze DOM (bez závislosti na jiném scope)
    const shareBtnEl = document.getElementById('shareLocationBtn');
    const visibilityBtnEl = document.getElementById('visibilityBtn');
    const customActionBtnEl = document.getElementById("customActionBtn");
    

    if (tab === "map") {
  if (shareBtnEl) shareBtnEl.style.display = "flex";
  if (visibilityBtnEl) visibilityBtnEl.style.display = "flex";
  const customActionBtn = document.getElementById("customActionBtn");
  if (customActionBtn) customActionBtn.style.display = "flex";
} else {
  if (shareBtnEl) shareBtnEl.style.display = "none";
  if (visibilityBtnEl) visibilityBtnEl.style.display = "none";
  const customActionBtn = document.getElementById("customActionBtn");
  if (customActionBtn) customActionBtn.style.display = "none";
}

    // User panel mimo People pryč
    const userPanel = document.getElementById("userDetailPanel");
    if (userPanel) {
      userPanel.classList.remove("active");
      userPanel.style.display = (tab === "map") ? "block" : "none";
    }

    // Chat scroll fix
    if (tab === "chat") {
      const chatDiv = document.getElementById('chat');
      chatDiv.scrollTop = chatDiv.scrollHeight;
    }

  });
});



window.addEventListener("load", () => {
  const loader = document.getElementById("globalLoader");
  if (loader) {
    loader.style.display = "none";
  }

  // Explore map loaded in iframe - initialization handled there
});

const chatHeader = document.getElementById("chatHeader");
const chatGroupTitle = document.getElementById("chatGroupTitle");

document.querySelectorAll(".chat-group").forEach(group => {
  group.addEventListener("click", () => {
    chatGroups.style.display = "none";
    chatDiv.style.display = "block";
    formEl.style.display = "flex";
    chatHeader.style.display = "flex"; // zobraz header
    chatGroupTitle.textContent = group.querySelector("span").textContent; // název skupiny
    backBtn.style.display = "inline-block";

    loadMessages(group.dataset.group);
  });
});

backBtn.addEventListener("click", () => {
  chatDiv.style.display = "none";
  formEl.style.display = "none";
  chatGroups.style.display = "flex";
  chatHeader.style.display = "none"; // skryj header
});

// ========================================
// HOME PAGE - FAQ ACCORDION
// ========================================
function initializeFAQ() {
  const faqButtons = document.querySelectorAll('.faq-question');
  if (faqButtons.length === 0) return; // Elements not ready yet

  faqButtons.forEach(button => {
    // Check if already initialized
    if (button.hasAttribute('data-faq-initialized')) return;

    button.setAttribute('data-faq-initialized', 'true');

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const faqItem = button.parentElement;
      const wasActive = faqItem.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current FAQ
      if (!wasActive) {
        faqItem.classList.add('active');
      }
    });
  });
}

// ========================================
// HOME PAGE - ROAD STATUS SUMMARY
// ========================================

// ✅ Global flag to track if message listener is already set up
let roadStatusListenerInitialized = false;

function updateRoadStatus() {
  console.log('🗺️ Updating road status...');

  const iframe = document.getElementById('froadsMap');
  if (!iframe) {
    console.warn('⚠️ Iframe froadsMap not found');
    return;
  }

  // ✅ Set up message listener only once
  if (!roadStatusListenerInitialized) {
    window.addEventListener('message', function handleRoadStatus(event) {
      if (event.data && event.data.type === 'ROAD_STATUS_RESPONSE') {
        const { open, closed, unknown } = event.data;

        const openEl = document.getElementById('roadsOpen');
        const closedEl = document.getElementById('roadsClosed');
        const unknownEl = document.getElementById('roadsUnknown');

        if (openEl) openEl.textContent = open || 0;
        if (closedEl) closedEl.textContent = closed || 0;
        if (unknownEl) unknownEl.textContent = unknown || 0;

        console.log(`✅ Road status updated: ${open} open, ${closed} closed, ${unknown} unknown`);
      }
    });
    roadStatusListenerInitialized = true;
  }

  // ✅ Request road status data from explore.html iframe
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'GET_ROAD_STATUS' }, '*');
    console.log('📤 Road status request sent to iframe');
  }
}

// ✅ Initialize road status when user logs in
auth.onAuthStateChanged(user => {
  if (user) {
    // ✅ Set up iframe load listener
    const froadsIframe = document.getElementById('froadsMap');
    if (froadsIframe) {
      // If iframe is already loaded, update immediately
      if (froadsIframe.contentDocument && froadsIframe.contentDocument.readyState === 'complete') {
        console.log('✅ Froads iframe already loaded');
        setTimeout(() => updateRoadStatus(), 1000);
      } else {
        // Otherwise wait for load event
        froadsIframe.addEventListener('load', function() {
          console.log('✅ Froads iframe loaded');
          setTimeout(() => updateRoadStatus(), 1000);
        }, { once: true });
      }
    }

    // Also try to update after a delay (backup)
    setTimeout(() => updateRoadStatus(), 3000);

    // ✅ Road status updates every 5 minutes
    setInterval(() => {
      if (document.getElementById('homeSection').style.display !== 'none') {
        updateRoadStatus();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
});

// ========================================
// HOME PAGE - JOURNAL SLIDER NAVIGATION
// ========================================
function initJournalSlider() {
  const journalGrid = document.getElementById('journalGrid');
  const prevBtn = document.getElementById('journalPrev');
  const nextBtn = document.getElementById('journalNext');

  if (!journalGrid || !prevBtn || !nextBtn) {
    console.warn('⚠️ Journal slider elements not found');
    return;
  }

  // Check if already initialized
  if (prevBtn.hasAttribute('data-slider-initialized')) {
    console.log('✅ Journal slider already initialized');
    return;
  }

  console.log('🎯 Initializing journal slider...');

  // Mark as initialized
  prevBtn.setAttribute('data-slider-initialized', 'true');
  nextBtn.setAttribute('data-slider-initialized', 'true');

  // Update button disabled states based on scroll position
  function updateButtonStates() {
    const isAtStart = journalGrid.scrollLeft <= 0;
    const isAtEnd = journalGrid.scrollLeft + journalGrid.clientWidth >= journalGrid.scrollWidth - 1;

    prevBtn.disabled = isAtStart;
    nextBtn.disabled = isAtEnd;

    console.log(`Scroll position: ${journalGrid.scrollLeft}, isAtStart: ${isAtStart}, isAtEnd: ${isAtEnd}`);
  }

  // Scroll one card width at a time
  function scrollSlider(direction) {
    const cardWidth = journalGrid.querySelector('.journal-card').offsetWidth;
    const gap = 20; // gap between cards
    const scrollAmount = cardWidth + gap;

    console.log(`Scrolling ${direction}, amount: ${scrollAmount}`);

    if (direction === 'next') {
      journalGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      journalGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }

    // Update button states after scroll
    setTimeout(updateButtonStates, 300);
  }

  // Event listeners
  prevBtn.addEventListener('click', () => {
    console.log('⬅️ Previous button clicked');
    scrollSlider('prev');
  });

  nextBtn.addEventListener('click', () => {
    console.log('➡️ Next button clicked');
    scrollSlider('next');
  });

  journalGrid.addEventListener('scroll', updateButtonStates);

  // Initial state
  updateButtonStates();

  console.log('✅ Journal slider initialized successfully');
}
