import { setUserRole } from "./setCustomClaims";

const uid = "STv7us9iZ2YEEWCx4TXeaLkKh6S2"; // Replace with target UID
const role: "admin" | "resource" = "admin"; // or "resource"

setUserRole(uid, role).catch(console.error);


// console.log(role)

