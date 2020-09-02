/**
  An Express middleware handler for basic Authentication to the Medten API.
  Expects a BASIC authentication header constructed from account_id (as username)
  and apikey (as password).
*/
const debug = require('debug')('medten:security');
const auth = require('basic-auth');
const moment =  require('moment');
/** Note: Authorization API (OAuth etc) urls are not handled by this authorizer. */
const PATH_ANY_REGEX = /\/(.*)/i;
// const PATH_ACCOUNT_REGEX = /\/accounts\/(\d+)(\/.*)?/i;
const MASTER_ACCOUNT_ID = 1;

/**
  Authorization cache initializer. This function initializes a global cache of authenticated API Keys and principals.
  The global cache is checked on each request to the API to validate the requestor has access to the data being requested.

   @param {object} app the express app. An app.locals.Database property with the db data access factory reference is expected.
   @param {object} opts options 
   @param {number} opts.check_interval_ms time interval for checking and cleaning cache entries
*/
async function initAuthorizationCache(app, opts){
  app.locals.AuthorizationCache = { principals: [] };

  cleanCache();
  setInterval(cleanCache, opts.check_interval_ms);

  async function cleanCache(){
    try{
      let results = await app.locals.Database.ApiKey().find({status: "active"}, {limit: 1000});
      
      let i = app.locals.AuthorizationCache.principals.length;
      while(i--){ //count down so reindexing after splice doesn't matter.
        let cachedPrincipal = app.locals.AuthorizationCache.principals[i];
        let matchingPrincipal = results.findIndex(valid => { return valid.apikey == cachedPrincipal.apikey; });
        if(!matchingPrincipal){
          //evict
          app.locals.AuthorizationCache.principals.splice(i, 1);
        } else {
          if(isExpired(matchingPrincipal.expires)){
            debug('Evicting expired entry...')
            app.locals.AuthorizationCache.principals.splice(i, 1);
          }
        }
      }

      if(app.locals.AuthorizationCache.principals.length > 0){
        debug(`${app.locals.AuthorizationCache.principals.length} entries in the authorization cache.`);
      }
      
    }catch(ex){
      console.error("Error cleaning API authorization cache.");
      console.error(ex);
    }
  }

}

/**
  The middleware authorizer function.
  
  Authorizes API access for the account and connector APIs.
  
  Expects a basic authentication token. The token should be composed of a 
  username = Medten account id and a password = a valid api key for the account.
  Alternatively a request parameter named 'gr8token' can be provided with the same base-64 encoded
  credentials.
  
  Read-only methdods (i.e. GET API methods ) require no authentication (this allows the API to support the "browse" application).

  For admin roles and master account, allow access to urls matching `/*`.

  For non-admin accounts... TBD. Could be something like this:
   If the requested url contains an account id (i.e. matches `/accounts/:account_id/*`), then that account MUST match the principal's account id. 
      This prevents one account from accessing other account's data.

  Upon successful authorization, the principal (account and, if applicable user information) is 
  placed on the `req.locals.principal` property.

  This collaborates with an authorization cache provided on the app globally. You must invoke initAuthorizationCache
  prior exposing any routes covered with this authorizer.

  @param {object} app the express app. Expects an `app.locals Database` property with the db factory reference
  @param {object} opts options 
  @param {number} opts.check_interval_ms time interval for checking and cleaning cache entries
*/
async function authorizer(req, res, next) {

  try {
    if(req.method === 'GET'){
      //TODO: a stricter policy should be implemented
      debug(`Allowed (read-only).`);
      next();
      return;
    }

    let token = auth(req); 
    debug(`${req.method} ${req.originalUrl}`);
    if (!token){

      //Allow it to be provided as a request parameter.
      if(req.query.token){
        token = auth.parse(req.query.token);
      }

      if(!token){
        debug(`No credentials found.`);
        return deny(req, res);//No token present/parsed
      }
    } 

    let principal = lookupAuthFromCache(req, token.pass);
    if(!principal){
      principal = {
        account_id: null,
        user_id: null,
        roles: []
      };

      let apikeyInfo = await req.app.locals.Database.ApiKey().one({ apikey: token.pass });
      if (!apikeyInfo || apikeyInfo === {}) return deny(req, res);
      principal.apikey = apikeyInfo.apikey;
      principal.expires = apikeyInfo.expires;

      if (apikeyInfo.status !== 'active') return deny(req, res); //don't allow inactive entries
      if (isExpired(apikeyInfo.expires)) return deny(req, res); //don't allow expired entries

      //Initialize the principal (who/what is requesting access) object.
      principal.account_id = token.name;//the token is composed of the account id and apikeyInfo (apikey column).
      principal.user_id = apikeyInfo.user_id;
      
    } else {
      debug(`Using cached principal.`);
    }

    //The requested path must match the appropriate path REGEX
    debug(`requested path: ${req.originalUrl}`);

    if(principal.account_id == MASTER_ACCOUNT_ID || principal.roles.includes('admin')){
      debug(`checking for master account policy...`);
      //For admin roles and master account, allow access to ANY PATH.
      let match_result = PATH_ANY_REGEX.exec(req.originalUrl);
      //debug(match_result);
      if (!match_result) return denyUnauthorized(req, res);

      //Permitted
      debug(`Allowed (master).`);
      cacheAuth(req, principal);
      res.locals.principal = principal;
      next();

    } else{
      debug(`checking for non-admin policy...`);
      //For non-admin accounts...
      // 1) If the requested path contains an account id, then it MUST match the principal's account id. 
      //    This prevents one account from accessing other account's data.
      // 2) If the requested path is in the global path namespace, then the principal may access it.
      
      //debug(match_result);
      let deny_access = true; // deny by default.

      /*
        Future use...
      let match_result = PATH_ACCOUNT_REGEX.exec(req.originalUrl);
      
      if(match_result && match_result[1]){
        //It is an account-specific path.
        if (match_result[1] == principal.account_id ) {
          deny_access = false;
        } else {
          //The account id does not match.
          // deny_access = true;
          //console.log(`Account ids did not match. ${match_result.groups.accountid} vs ${principal.name}`)
        }
      }
      */

      if(deny_access){
        return denyUnauthorized(req, res);
      }

      //Permitted...
      debug(`Allowed (standard).`);
      cacheAuth(req, principal);
      res.locals.principal = principal;
      next();
    }
    
  } catch (ex) {
    console.error(ex);
    return deny(req, res);//pessimistic
  }
};


function lookupAuthFromCache(req, the_key){
  
  debug(`cache has ${req.app.locals.AuthorizationCache.principals.length}.`);
  let result = req.app.locals.AuthorizationCache.principals.find(function(p){ return p.apikey == the_key; });
  if(!result){
    debug(`No cached auth found for: ${the_key}`);
    return null;
  } else {
    debug(`Found: ${JSON.stringify(result)}`);
    return result;
  }
}

/**
 * Test a date string to see whether it is expired.
 * @param {string} expiry datetime value of the form YYYY-MM-DD HH:mm:ss, implied in UTC
 */
function isExpired(expiry){
  if(!expiry) return false;
  let expiryMoment = moment(`${expiry}Z`, "YYYY-MM-DD HH:mm:ssZ");
  return moment().isAfter(expiryMoment); 
}

function cacheAuth(req, principal){
  let existing = lookupAuthFromCache(req, principal.apikey);
  if(!existing){
    req.app.locals.AuthorizationCache.principals.push(principal);
  }
}

/** Indicates the request failed because the credentials were invalid or no longer valid (i.e. expired). */
function deny(req, res){
  res.status(401).json({message: "Invalid/expired credentials."});
}

/** Indicates the request failed because the principal lacks authorization for the api, but IS authenticated. */
function denyUnauthorized(req, res){
  res.status(403).json({message: "Unauthorized."});
}

exports.authorizer = authorizer;
exports.initAuthorizationCache = initAuthorizationCache;