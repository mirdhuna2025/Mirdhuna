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
  apiKey: "AIzaSyCiG3Tal0dCpBAV1SLS2Rbs6GYOA4zomQE",
  authDomain: "mirdhuna-4f652.firebaseapp.com",
  databaseURL: "https://mirdhuna-4f652-default-rtdb.firebaseio.com",
  projectId: "mirdhuna-4f652",
  storageBucket: "mirdhuna-4f652.firebasestorage.app",
  messagingSenderId: "184403369330",
  appId: "1:184403369330:web:859bcf3162bc2d2ed7d1eb",
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
