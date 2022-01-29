const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');

// Utils
const { fbConfig } = require('../config');

const firebaseConfig = {
	apiKey: fbConfig.apiKey,
	authDomain: fbConfig.authDomain,
	projectId: fbConfig.projectId,
	storageBucket: fbConfig.storageBucket,
	messagingSenderId: fbConfig.messagingSenderId,
	appId: fbConfig.appId,
	measurementId: fbConfig.measurementId,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(firebaseApp);

module.exports = { firebaseApp, firebaseStorage, ref, uploadBytes };
