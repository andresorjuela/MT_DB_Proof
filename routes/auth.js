var express = require('express');
var router = express.Router({mergeParams: true});
const debug = require('debug')('medten:security');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {uuid} = require('uuidv4');
const moment = require('moment');

const MIN_USERNAME_LENGTH = 4;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_VALIDATION_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/
const MAX_BAD_LOGINS = 5;


router.get('/hash', function(req, res, next){
  if(!req.query.token){
    res.status(204).end();
    return;
  }
  var salt = bcrypt.genSaltSync(12);
  var hash = bcrypt.hashSync(req.query.token, salt);
  res.status(200).send(hash);
});

/* 
  Accept a posted username/password. If valid, an apikey and expiration will be returned.
  The API token returned is not permanent and will be deleted by a cleanup process.
  
  The returned json payload has the form:
  @example
  {
      "account_id": 12345,
      "apikey": "b6822692-d9c4-4027-9ccd-b79629c2625a",
      "expires": "2020-02-29T23:13:30",
      "principal":{
        "type": "user",
        "id": 56789 // the user id
        "roles": ["admin"] 
      }
  }
*/
router.post('/login', async function(req, res, next) {
  if(!req.body){
    res.status(400).end();
    return;
  }
  let username = req.body.username;
  let password = req.body.password;
  try{
    let UserDao = res.app.locals.Database.User();
    let ApiKeyDao = res.app.locals.Database.ApiKey();
    if( !username 
      || (''+username).length < MIN_USERNAME_LENGTH
      || !password
      || (''+password).length < MIN_PASSWORD_LENGTH ){
      res.status(401).end();
      debug('credentials failed requirements');
      return;
    }
    
    let user = await UserDao.one({username: username});
    if(!user){
      debug('user was not found');
      res.status(401).end();
      return;
    }

    if( !bcrypt.compareSync(password, user.password) ){
      debug('password is invalid');
      //count bad logins.
      user.bad_login_attempts++;
      
      // //deactivate user if too many
      // if(user.bad_login_attempts >= MAX_BAD_LOGINS ){
      //   debug('user has exceeded bad login limit');
      //   user.status = "suspended";
      // }

      res.status(401).end();

      //Update.
      await UserDao.update(user);
      return;
    }

    if(user.status !== "active" ){
      debug('user is not active');
      res.status(400).json({message: "Can't login.", error: "Your user account is not active."});
      return;
    }

    //reset bad logins
    user.bad_login_attempts = 0;
    user.last_login = moment().utc().format('YYYY-MM-DDTHH:mm:ss');
    user.login_count += 1;
    await UserDao.update(user);
    
    //Generate the apikey and expiration
    let apikey = uuid();
    let expires = moment().utc().add(1,'day').format('YYYY-MM-DDTHH:mm:ss');
    
    if(user.default_account_id){
      let dbApiKey = {
        account_id: user.default_account_id,
        status: "active",
        apikey,
        user_id: user.id,
        expires
      }

      //FUTURE: Users may not have more than one active key. Delete any old ones before saving a new one.
      // await ApiKeyDao.deleteMatching({
      //   account_id: user.default_account_id, 
      //   user_id: user.id
      // });

      //Save the new one
      await ApiKeyDao.create(dbApiKey);
    }
    
    //NOTE: the apikey will not be recognized if it is not saved.
    //It can be useful for testing to receive non-valid, but generated keys.
    
    delete user._affectedRows;
    delete user.bad_login_attempts;
    delete user.last_login;
    delete user.password;
    delete user.reset_password_token;
    delete user.reset_password_token_expires;
    delete user.status;
    delete user.version;
    
    let principal = user;
    principal.type = "user"

    //Lastly get the roles for the user if any. (future?)
    // let user_roles = await res.app.locals.Database.UserRole().find({user_id: user.id});
    // principal.roles = user_roles ? user_roles.map(ur=>{return ur.role}) : [];

    res.status(200).json({
      apikey,
      expires,
      account_id: user.default_account_id, 
      principal,
    });
    
  }catch(ex){
    console.error(`Error. ${ex.message}`);
    console.error(ex);
    res.status(500).end();
  }
 
});


router.post('/logout', async function(req, res, next) {
  
  try{
    let UserDao = await res.app.locals.Database.User();
    let ApiKeyDao = await res.app.locals.Database.ApiKey();

    if(!req.body) {
      return res.status(400).json({message: "Unable to logout."});
    }
   
    let user = await UserDao.one({username: req.body.username});
    
    if(!user){
      debug('user was not found');
      return res.status(400).json({message: "Unable to logout."});
    }

    //Delete any associated user-specific API keys.
    await ApiKeyDao.deleteMatching({
      account_id: user.default_account_id, 
      user_id: user.id
    });

    res.status(200).json({message: "Logged out."});
    
  }catch(ex){
    console.error(ex);
    console.error(`Error during logout. ${ex.message}`);
    res.status(500).end();
  }
 
});


//
// Forgot password processing.
//
const sgmail = require('@sendgrid/mail');
router.post('/password/forgot', async function(req, res, next) {
  if(!process.env.SENDGRID_API_KEY) throw new TypeError(`Configure the "SENDGRID_API_KEY" environment variable.`);
  if(!process.env.SUPPORT_EMAIL_ADDRESS) throw new TypeError(`Configure the "SUPPORT_EMAIL_ADDRESS" environment variable.`);
  if(!process.env.RESET_PASSWORD_URL) throw new TypeError(`Configure the "RESET_PASSWORD_URL" environment variable.`);

  if(!req.body || !req.body.email){
    debug('no email detected');
    res.status(400).end();
    return;
  }
  let email = req.body.email;
  let standardResponse = {message: "If an account was found, instructions have been sent to that email address."};
  try{
    let UserDao = req.app.locals.Database.User();
    let user = await UserDao.one({email});
    if(!user){
      res.status(200).json(standardResponse);
      return; 
    }

    user.reset_password_token = uuid();
    user.reset_password_token_expires = moment().add(1, 'hour');
    await UserDao.update(user);

    sgmail.setApiKey(process.env.SENDGRID_API_KEY);

    var reset_password_link = `${process.env.RESET_PASSWORD_URL}?token=${user.reset_password_token}`;

    let msg = {
      to: email,
      from: process.env.SUPPORT_EMAIL_ADDRESS,
        
    };
    if(user.password === null){
      //New users will have an empty password.
      msg.subject = 'Account Verification Instructions';
      
      msg.text = `
Hello ${user.first_name},
Please activate your account by confirming your email address and setting your initial password. Follow this link or paste it in a browser:
- - - - -
${reset_password_link}
- - - - -
This link will expire in one hour.

If you were not expecting this message or did not request a new user account/password, please ignore this message.
-Medten Support
`;
    
          msg.html = `
<p>Hello ${user.first_name},</p>
<p>Please activate your account by confirming your email address and setting your initial password. Follow this link or paste it in a browser:</p>
<hr/>
${reset_password_link}
<hr/>
<p>This link will expire in one hour.<br/></p>
<p>If you were not expecting this message or did not request a new user account/password, please ignore this message.</p>
<p><br/>-Medten Support</p>`;

    } else {
      //Existing users will have an non-empty password.
      msg.subject = 'Password Reset Instructions';
      
      msg.text = `
Hello ${user.first_name},
To reset your password, please follow this link or paste it in a browser:
- - - - -
${reset_password_link}
- - - - -
This link will expire in one hour.

If you did not request a new password, please ignore this message.
-Medten Support
`;

      msg.html = `
<p>Hello ${user.first_name},</p>
<p>To reset your password, please follow this link or paste it in a browser:</p>
<hr/>
${reset_password_link}
<hr/>
<p>This link will expire in one hour.<br/></p>
<p>If you did not request a new password, please ignore this message.</p>
<p><br/>-Medten Support</p>`;

    }
    
    await sgmail.send(msg);

    res.status(200).json(standardResponse);
    
  }catch(ex){
    console.error(ex);
    console.error(`Error processing forgot-password request. ${ex.message}`);
    res.status(500).end();
  }
 
});


//
// Reset password API. 
//
const PASSWORD_SALT_ROUNDS=11;
router.post('/password/reset', async function(req, res, next){
  try{
    let UserDao = req.app.locals.Database.User();
    debug('Resetting password...')
    if(!req.body.token || !req.body.password){
      debug("No token or no password on the request.")
      return res.status(400).json({message: "Unable to reset password.", error: "Invalid parameters."});
    }

    //Validate the password.
    if(!PASSWORD_VALIDATION_REGEX.test(req.body.password)){
      debug("Password does not meet requirements.")
      return res.status(400).json({message: "Unable to reset password.", error: "Your password isn't complex enough. It must be at least 8 characters long and include numbers, upper and lowercase letters."});
    }

    let user = await UserDao.one({reset_password_token: req.body.token});
    if(!user || user.status === 'deleted'){
      debug("No user, or user marked for deletion.")
      return res.status(400).json({message: "Unable to reset password.", error: "Invalid parameters."});
    }

    //Validate the token.
    var tokenExpiration = moment(user.reset_password_token_expires);
    if(tokenExpiration.isBefore(moment())){
      debug("Old token.")
      return res.status(400).json({message: "Unable to reset password.", error: "Invalid parameters."});
    }

    let hashedPass = await bcrypt.hash(req.body.password, PASSWORD_SALT_ROUNDS);
    //Reset counters, clear the token
    user.password = hashedPass;
    user.must_reset_password = false;
    user.reset_password_token = null;
    user.reset_password_token_expires = null;
    user.bad_login_attempts = 0;
    await UserDao.update(user);

    return res.status(200).json({message: "Password reset successfully."});

  }catch(ex){
    console.error(ex);
    console.error(`Error resetting password. ${ex.message}`);
    res.status(500).end();
  }

});

module.exports = router;
