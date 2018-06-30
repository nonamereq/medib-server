const User = require('../models/user');
const common = require('../common');

class UserController{
    constructor(user){
        this.user = user;
    }

    /*
     * @description Logs in the user
     * @param loginCallback function
     * @return none
     */
    login(loginCallback){
        let user= this.user;
        User.findOne({name: this.user.name}, 'name password email amount isAdmin'  ,(err, user_doc) => {
            if(err){
                loginCallback( {
                    success: false, 
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else if(user_doc == null){
                loginCallback({
                    success: false,
                    status: 200,
                    err: { message: 'Username or password incorrect' }
                });
            }
            else if(user_doc.comparePassword(user.password)){
                user_doc = user_doc.toObject();
                delete user_doc.password;
                delete user_doc.email;
                loginCallback( {
                    success: true,
                    status: 200,
                    doc: user_doc
                });
            }
            else{
                loginCallback({
                    success: false,
                    status: 200,
                    err: { message: 'Username or password incorrect' }
                });
            }
        });
    }

    /*
     * @description Signs up the user
     * @param user Object
     * @param signupCallback function
     * @return none
     */
    static signup(user, signupCallback){
        delete user.amount;
        let user_model = new User(user);
        user_model.save((err, doc) => {
            if(err){
                signupCallback({
                    success: false, 
                    status: common.getStatusCode(err),
                    err: err
                });
            }else{
                if(doc != null){
                    doc = doc.toObject();
                    delete doc.password;
                    delete doc.email;
                }
                signupCallback({
                    success: true,
                    status: 200,
                    doc: doc
                });
            }
        });
    }


    /*
     * @description Check if user existst
     * @param user_name string
     * @param userExistsCallback function
     */
    static userExists(user_name, userExistsCallback){
        User.findOne({name: user_name}, 'name', (err, user) => {
            if(err){
                userExistsCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else if (user != null)
                userExistsCallback({
                    success: true,
                    status: 200,
                    exists: true
                });
            else
                userExistsCallback({
                    success: true,
                    status: 200,
                    exists: false
                });
        });
    }

    /*
     * @description Check if user existst
     * @param user_name string
     * @param userExistsCallback function
     */
    static emailExists(email, emailExistsCallback){
        User.findOne({email: email} , 'email', (err, user) => {
            if(err){
                emailExistsCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else if (user != null)
                emailExistsCallback({
                    success: true,
                    status: 200,
                    exists: true
                });
            else
                emailExistsCallback({
                    success: true,
                    status: 200,
                    exists: false
                });
        });
    }
}

module.exports = UserController;
