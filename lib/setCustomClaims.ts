// setCustomClaims.ts
import * as admin from "firebase-admin";
const serviceAccount = require("./service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function setUserRole(uid: string, role: "admin" | "resource") {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`✅ Set role "${role}" for user ${uid}`);
}
