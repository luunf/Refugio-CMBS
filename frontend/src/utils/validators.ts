
export const isEmailValid = (
  email: string
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
};

export const isPhoneValid = (
  phone: string
) => {
  return /^[0-9+\-\s()]+$/.test(
    phone.trim()
  );
};