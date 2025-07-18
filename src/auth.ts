import { decodeJwt, importPKCS8, SignJWT } from "jose";
import { privateKeyPEM, kid } from "./authCredentials";

export async function createSignedJWT(
  payload: any,
  options: {
    issuer?: string;
    audience?: string;
    expiresIn?: string;
    subject?: string;
    issuedAt?: string;
    alg?: "RS256" | "ES256" | (string & { ignore_me?: never });
  } = {},
) {
  const privateKey = await importPKCS8(privateKeyPEM, "RS256");
  const {
    issuer = "https://issuer.example.com/1",
    audience = "App 1",
    expiresIn = "1h",
    subject = "The Subject",
    alg = "RS256",
    issuedAt = "10 sec ago",
  } = options;

  let jwtBuilder = new SignJWT(payload)
    .setProtectedHeader({
      kid,
      alg,
    })
    .setIssuedAt(issuedAt);

  if (issuer !== undefined) {
    jwtBuilder = jwtBuilder.setIssuer(issuer);
  }

  if (audience !== undefined) {
    jwtBuilder = jwtBuilder.setAudience(audience);
  }

  const jwt = await jwtBuilder
    .setSubject(subject)
    .setExpirationTime(expiresIn)
    .sign(privateKey);

  const decodedPayload = decodeJwt(jwt);
  console.log(decodedPayload);

  return jwt;
}
