module.exports = getCookiesOptionBasedOnUserAgent = (userAgent) => {
  const cookiesOptions = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };
  const { family, major } = useragent.parse(userAgent) || {};
  if (family === 'Chrome' && +major >= 51 && +major <= 66) {
    delete cookiesOptions.sameSite;
    delete cookiesOptions.secure;
  }
  return cookiesOptions;
}