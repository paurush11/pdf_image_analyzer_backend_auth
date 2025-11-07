export const formatExpirationTime = (exp: number): string => {
  const date = new Date(exp * 1000);
  return date.toISOString();
};

export const isTokenExpired = (exp: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime > exp;
};

export const getRemainingTime = (exp: number): number => {
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingTime = exp - currentTime;
  return remainingTime > 0 ? remainingTime : 0;
};
