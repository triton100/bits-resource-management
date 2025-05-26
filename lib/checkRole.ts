// checkUserRole.ts
import * as admin from "firebase-admin";
const serviceAccount = require("./service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function checkRole(uid: string) {
  const user = await admin.auth().getUser(uid);
  console.log("Custom Claims:", user.customClaims);
}

checkRole("STv7us9iZ2YEEWCx4TXeaLkKh6S2").catch(console.error);
