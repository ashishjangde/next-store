import * as bcryptjs from 'bcryptjs';

const SAlT = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, SAlT);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcryptjs.compare(password, hashedPassword);
};
