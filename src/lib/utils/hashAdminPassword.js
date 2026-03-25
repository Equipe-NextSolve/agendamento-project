import bcrypt from "bcryptjs";

export async function hashAdminPassword(value) {
  return bcrypt.hash(value, 10);
}

const generateHash = await hashAdminPassword("AdM&3344");
console.log(generateHash);
