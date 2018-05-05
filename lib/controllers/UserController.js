const User = require('../models/users');

class UserController{
    constructor(user){
        this.user = user;
    }

    verify(callback, err_callback){
        let user= this.user;
        User.find({name: this.user.name} ,(err, docs) => {
            if(err){
                err_callback(null, {err: true, msg: 'username or password incorrect'});
            }
            else if(this.password == user.password){
                callback(docs, null);
            }
            else{
                err_callback(null, {err: true, msg: 'username or password incorrect'});
            }
        });
    }

    login(loginCallback){
        let callback = (doc, err) => {
            if(err){
                loginCallback({
                    success: false,
                    msg: err.msg
                });
            }
            else{
                loginCallback({
                    success: true,
                    user: doc
                });
            }
        };
        this.verify(callback, callback);
    }

    signup(user, signupCallback){
        let user_model = new User(user);
        user_model.save((err) => {
            if(err){
                signupCallback(false, err);
            }else{
                signupCallback(true, null);
            }
        });
    }

    index(user, indexCallback){
        this.login((doc) => {
            if(doc.success){
                indexCallback({
                    success: false,
                    redirectTo: '/home'
                });
            }
            else{
                indexCallback({
                    success: true
                });
            }
        });
    }
}

module.exports = UserController;
