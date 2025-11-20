// This file provides a single source of truth for all API and Firebase config

export function getConfig() {
  try {
    const saved = localStorage.getItem("mirdhunConfig")
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn("Error loading config from localStorage:", e)
  }

  // Return default config if localStorage fails
  return {
    firebase: {
      apiKey: "AIzaSyCPbOZwAZEMiC1LSDSgnSEPmSxQ7-pR2oQ",
      authDomain: "mirdhuna-25542.firebaseapp.com",
      databaseURL: "https://mirdhuna-25542-default-rtdb.firebaseio.com",
      projectId: "mirdhuna-25542",
      storageBucket: "mirdhuna-25542.appspot.com",
      messagingSenderId: "575924409876",
      appId: "1:575924409876:web:6ba1ed88ce941d9c83b901",
    },
    googleMapsKey: "AIzaSyCPbOZwAZEMiC1LSDSgnSEPmSxQ7-pR2oQ",
    adminPassword: "Sanu.0000",
  }
}

export function getFirebaseConfig() {
  return getConfig().firebase
}

export function getGoogleMapsKey() {
  return getConfig().googleMapsKey
}

export function getAdminPassword() {
  return getConfig().adminPassword
}
