export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.trim() !== '';
};

export const isValidRating = (rating) => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

export const isValidYear = (year) => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear;
};
