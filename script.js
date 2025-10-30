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
    if (placeholder) placeholder.style.display = "none";
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

    // Forgot password
document.getElementById("forgotPasswordLink").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const errorEl = document.getElementById("loginError");

  if (!email) {
    errorEl.textContent = "Please enter your email first.";
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    errorEl.style.color = "green";
    errorEl.textContent = "Password reset link has been sent to your email.";
  } catch (err) {
    console.error("Password reset error:", err);
    errorEl.style.color = "red";
    errorEl.textContent = "Couldn't send reset link. Please check your email.";
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
    const user = cred.user;

    // Nastav displayName v Auth
    await user.updateProfile({ displayName: fullName });

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
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    errorEl.textContent = "";
    showAccessDeniedModal();
    await auth.signOut();
  } catch (err) {
    console.error("Signup error:", err);
    errorEl.textContent = "Looks like you already have an account! Try logging in.";
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
    if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "flex";
    avatarInput.value = "";
    vehiclePhotoInput.value = "";

    return;
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
  setTimeout(() => initializeFAQ(), 100);
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
const userDoc = await userRef.get({ source: 'server' });

if (!userDoc.exists) {
  await userRef.set({
    displayName: user.displayName || "User",
    photoURL: "",
    bio: "",
    instagram: "",
    vehicle: "",
    vehiclePhotoURL: "",
    verified: false,
    ranger: false,
    access: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  console.log("✅ New clean profile created for:", user.uid);
} else {
  // 🧹 Reset cizích dat při novém přihlášení (bez access)
  const existingData = userDoc.data();
  if (existingData && !existingData.access) {
    // 🔒 BEZPEČNOSTNÍ FIX: Přepiš VŠECHNA pole na výchozí hodnoty
    await userRef.set({
      displayName: user.displayName || "User",
      email: user.email || "",
      bio: "",
      instagram: "",
      vehicle: "",
      vehiclePhotoURL: "",
      photoURL: "",
      verified: false,
      ranger: false,
      access: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("🧼 Reset profile data for user without access:", user.uid);
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
  if (userData.vehiclePhotoURL) {
    vehiclePhotoPreview.src = userData.vehiclePhotoURL;
    vehiclePhotoPreview.style.display = "block";
    if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "none";
  } else {
    vehiclePhotoPreview.style.display = "none";
    if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "flex";
  }

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
  if (vehiclePhotoPlaceholder) vehiclePhotoPlaceholder.style.display = "flex";
  avatarInput.value = "";
  vehiclePhotoInput.value = "";

  // Zobraz login screen
  loginScreen.style.display = "flex";

  auth.signOut();
};


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
    if (data.vehiclePhotoURL) {
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
            ${data.vehiclePhotoURL
              ? `<img id="userVehiclePhoto" class="show" src="${data.vehiclePhotoURL}" alt="Vehicle photo" />`
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
      if (data.vehiclePhotoURL) {
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
      // ✅ Nastav lokální flag ještě před geolokací
liveWatchId = -1; // placeholder, značí že Live je aktivní, i když GPS ještě neběží

await userDocRef.set({
  displayName: user.displayName || "",
  photoURL: user.photoURL || "",
  isLive: true,
  lastSeen: firebase.firestore.FieldValue.serverTimestamp()
}, { merge: true });

// 🔁 Okamžitý refresh, aby bublina ukázala "Live" i po zoomu
setupLiveLocations();

// ✅ Teprve potom spusť sledování polohy
liveWatchId = navigator.geolocation.watchPosition(async pos => {
  if (!pos.coords) {
    console.warn("No coords returned from geolocation.");
    return;
  }

  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  try {
    await userDocRef.set({
      lat,
      lng,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("Failed to update live location:", err);
  }

}, err => {
  console.error("Geolocation error:", err);
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
  await startLive();
  btn.classList.add("active");
  btn.innerHTML = `
    <img src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ed633027976d278ff80bba_live-focus.png"
         alt="Live Icon" class="live-icon" />
    Stop Sharing
  `;


      // ✅ Okamžitý update ve Firebase
      const userDoc = await db.collection("users").doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      await db.collection("liveLocations").doc(user.uid).set({
        isLive: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName || "User",
        photoURL: user.photoURL || "",
        verified: userData.verified || false,
        ranger: userData.ranger || false
      }, { merge: true });

      // ✅ Okamžitý vizuální marker s pulzujícím rámečkem
      if (liveMarkers[user.uid]) {
        const icon = L.icon({
          iconUrl: user.photoURL || "https://www.gravatar.com/avatar?d=mp",
          iconSize: [44, 44],
          iconAnchor: [22, 44],
          className: "user-icon live-outline"
        });
        liveMarkers[user.uid].setIcon(icon);
      }

      

     // ✅ Okamžitě přepíšeme mini-popup na „Live“
const firstName = (user.displayName || "User").split(" ")[0];

// pokud už máš mini-popup uložený, aktualizuj jeho HTML
if (window.miniPopups && window.miniPopups[user.uid]) {
  const popupEl = window.miniPopups[user.uid].getElement();
  if (popupEl) {
    popupEl.innerHTML = `
      <div class="mini-popup-inner">
        <span class="mini-popup-name">
          ${firstName}
          ${user.verified ? '<img class="verified-icon" src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68ec104bbf6183f2f84c71b7_verified.png" alt="Verified" />' : ''}
          ${user.ranger ? '<img class="ranger-icon" src="https://cdn.prod.website-files.com/687ebffd20183c0459d68784/68fba159091b4ac6d4781634_ranger%20(1).png" alt="Ranger" />' : ''}
        </span>
        <span class="mini-popup-status live">Live</span>
      </div>
    `;
  }
}

// ✅ a do půl sekundy i update z Firestore
setTimeout(() => setupLiveLocations(), 500);

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
    if (vehiclePhotoPreview.src && vehiclePhotoPreview.src.startsWith("https://")) {
      vehiclePhotoURL = vehiclePhotoPreview.src;
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
      setTimeout(() => initializeFAQ(), 50);
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

    // 🧩 Načti zprávy
    await loadMessages(group.dataset.group);

    // 🔽 Automaticky skoč na konec (bez animace)
    const chatContainer = document.getElementById("chat");
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
// HOME PAGE - LIVE STATS
// ========================================
function updateLiveStats() {
  console.log('🔄 Initializing live stats...');

  // ✅ 1. People online now = všichni přihlášení uživatelé (všichni v liveLocations)
  db.collection('liveLocations')
    .onSnapshot(snapshot => {
      const onlineCount = snapshot.size;
      const el = document.getElementById('onlineUsers');
      if (el) {
        el.textContent = onlineCount;
        console.log('👥 People online now:', onlineCount);
      }
    }, err => {
      console.error('❌ Error counting online users:', err);
      const el = document.getElementById('onlineUsers');
      if (el) el.textContent = '0';
    });

  // ✅ 2. Sharing location = pouze ti s isLive = true
  db.collection('liveLocations')
    .where('isLive', '==', true)
    .onSnapshot(snapshot => {
      const sharingCount = snapshot.size;
      const el = document.getElementById('sharingLocation');
      if (el) {
        el.textContent = sharingCount;
        console.log('🚗 Sharing location:', sharingCount);
      }
    }, err => {
      console.error('❌ Error counting sharing location:', err);
      const el = document.getElementById('sharingLocation');
      if (el) el.textContent = '0';
    });

  // ✅ 3. Messages today - počítáme ze všech chat skupin
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTimestamp = firebase.firestore.Timestamp.fromDate(todayStart);

  const chatGroups = ['general', 'river', 'froads', 'weather', 'campsites', 'cars', 'alerts', 'photos', 'help', 'community'];

  // Funkce pro přepočítání celkového počtu zpráv
  async function updateMessageCount() {
    try {
      const promises = chatGroups.map(group =>
        db.collection(`messages_${group}`)
          .where('createdAt', '>', todayTimestamp)
          .get()
      );

      const results = await Promise.all(promises);
      const total = results.reduce((sum, snap) => sum + snap.size, 0);

      const el = document.getElementById('messagesToday');
      if (el) {
        el.textContent = total;
        console.log('💬 Messages today:', total);
      }
    } catch (err) {
      console.error('❌ Error counting messages:', err);
      const el = document.getElementById('messagesToday');
      if (el) el.textContent = '0';
    }
  }

  // První načtení
  updateMessageCount();

  // Listener na každé skupině (při změně přepočítáme vše)
  chatGroups.forEach(group => {
    db.collection(`messages_${group}`)
      .where('createdAt', '>', todayTimestamp)
      .onSnapshot(() => {
        updateMessageCount();
      }, err => {
        console.error(`❌ Error listening to messages_${group}:`, err);
      });
  });
}

// ========================================
// HOME PAGE - ROAD STATUS SUMMARY
// ========================================
function updateRoadStatus() {
  console.log('🗺️ Updating road status...');

  // ✅ Request road status data from explore.html iframe
  const iframe = document.getElementById('froadsMap');
  if (iframe && iframe.contentWindow) {
    // Send request to iframe
    iframe.contentWindow.postMessage({ type: 'GET_ROAD_STATUS' }, '*');
  }

  // ✅ Listen for response from iframe
  window.addEventListener('message', function handleRoadStatus(event) {
    if (event.data && event.data.type === 'ROAD_STATUS_RESPONSE') {
      const { open, closed, unknown } = event.data;

      const openEl = document.getElementById('roadsOpen');
      const closedEl = document.getElementById('roadsClosed');
      const unknownEl = document.getElementById('roadsUnknown');

      if (openEl) openEl.textContent = open || 0;
      if (closedEl) closedEl.textContent = closed || 0;
      if (unknownEl) unknownEl.textContent = unknown || 0;

      console.log(`🗺️ Road status: ${open} open, ${closed} closed, ${unknown} unknown`);
    }
  });

  // ✅ Fallback: Pokud iframe neodpoví do 2 sekund, použij výchozí hodnoty
  setTimeout(() => {
    const openEl = document.getElementById('roadsOpen');
    const closedEl = document.getElementById('roadsClosed');
    const unknownEl = document.getElementById('roadsUnknown');

    // Pokud stále ukazují --, nastav výchozí hodnoty
    if (openEl && openEl.textContent === '--') openEl.textContent = '0';
    if (closedEl && closedEl.textContent === '--') closedEl.textContent = '0';
    if (unknownEl && unknownEl.textContent === '--') unknownEl.textContent = '0';
  }, 2000);
}

// ✅ Initialize real-time stats when user logs in
auth.onAuthStateChanged(user => {
  if (user) {
    // ✅ Start real-time listeners (only called once - they auto-update)
    updateLiveStats();

    // ✅ Road status updates less frequently (every 5 minutes)
    updateRoadStatus();
    setInterval(() => {
      if (document.getElementById('homeSection').style.display !== 'none') {
        updateRoadStatus();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
});



