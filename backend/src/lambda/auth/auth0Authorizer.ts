import { CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

import * as JwksRsa from 'jwks-rsa'


const jwksUrl = 'https://dev-pt0tuoz4u80btyss.us.auth0.com/.well-known/jwks.json'


const jwksClient = JwksRsa({
  jwksUri:jwksUrl
});

const logger = createLogger('auth')
// let cert 

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
// const jwksUrl = 'https://dev-nnc3gt5vh2ahpq6f.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: any
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

// async function verifyToken(authHeader: string): Promise<JwtPayload> {
//   const token = getToken(authHeader)
//   const jwt: Jwt = decode(token, { complete: true }) as Jwt

//   // TODO: Implement token verification
//   // You should implement it similarly to how it was implemented for the exercise for the lesson 5
//   // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

//   // Check header Type
//   if(jwt.header.alg !== 'RS256'){
//     logger.info("Auth certificate -> ", {
//       jwt
//     })
//     invalidToken("Invalid Header")
//   }
//   const authID = jwt.header.kid

//   // Get token from JSON Web Key
//   const getJksTokens = await Axios.get(jwksUrl)
//   const certTokens = getJksTokens.data.keys
//   if(!certTokens || certTokens.length < 1) {
//     invalidToken("invalid error")
//   }
//   const foundKeys = certTokens
//   .filter(key => 
//   key.kid === authID
//   && key.alg === 'RS256'
//   && key.kty === 'RSA'
//   )
//   if(foundKeys.length < 0){ 
//     invalidToken("invalid error")
//   }

//   // Build New Certificate fromm found token
//   const authKeys = foundKeys[0].x5c[0]
//   cert = `-----BEGIN CERTIFICATE-----\n${authKeys.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`
//   logger.info("Certificate :  ", {
//     cert
//   })
//   return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
// }

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

// function invalidToken(error: string) {
//   let newError = error || "Invalid Error"
//   throw new Error(newError)
// }


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  const signingKey = await jwksClient.getSigningKey(jwt.header.kid);

  return verify(token, signingKey.getPublicKey(), { algorithms: ["RS256"] }) as JwtPayload;

}