import bcrypt from "bcryptjs";

export const hashValue = async (value) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(value, salt);
};

export const compareHash = (value, hash) => {
  return bcrypt.compare(value, hash);
};
