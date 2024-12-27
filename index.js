
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require("cors")
const app = express();
app.use(bodyParser.json());
app.use(cors())

const firebaseCredentialsBase64 = process.env.FIREBASE_CREDENTIALS_BASE64;
const firebaseCredentials = JSON.parse(Buffer.from(firebaseCredentialsBase64, 'base64').toString('utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials),
});



const db = admin.firestore();

// API to Delete Multiple Users
app.post('/delete-users', async (req, res) => {
    const userIds = req.body.userIds; // Expecting an array of user IDs in the request body

    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
            error: "Invalid input. Provide a non-empty array of user IDs.",
        });
    }

    const results = { success: [], failure: [] };

    for (const userId of userIds) {
        try {
            // Delete user from Firebase Authentication
            await admin.auth().deleteUser(userId);
            console.log(`Successfully deleted user: ${userId} from Authentication`);

            // Delete user document from Firestore
            await db.collection('students').doc(userId).delete();
            console.log(`Successfully deleted user document for: ${userId}`);

            results.success.push(userId);
        } catch (error) {
            console.error(`Error deleting user: ${userId}`, error);
            results.failure.push({ userId, error: error.message });
        }
    }

    res.status(200).json(results);
});

// Start the server
const port = 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
