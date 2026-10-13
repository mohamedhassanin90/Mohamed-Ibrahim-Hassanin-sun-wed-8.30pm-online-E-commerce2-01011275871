import bcrypt from "bcrypt";

export async function hash(plaintext: string, salt = Number(process.env.SALT)) {
  return await bcrypt.hash(plaintext, salt);
}
export async function compare(plaintext: string, hash: string) {
  return await bcrypt.compare(plaintext, hash);
}
