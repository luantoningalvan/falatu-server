export function validateToken(headerString: string) {
  const tokenRegex = new RegExp(
    /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
  );

  const bearerRegex = new RegExp(/^Bearer/g);

  const parts = headerString.split(' ');
  if (parts[0].match(bearerRegex)) {
    if (parts[1] && parts[1].match(tokenRegex)) {
      return parts[1];
    }
    return false;
  }

  return false;
}
