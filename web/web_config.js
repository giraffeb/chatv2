module.exports = function(wrap, root_dirname){
    let express =require('express')
    let app = express();
    let cookieparser = require('cookie-parser');
    let jwt = require(root_dirname+'/util/jwt');
    
    app.use(express.static('static'));
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(cookieparser());

    app.use(function(req,res,next){
        let chatv2 = req.cookies.chatv2;
        let result = jwt.verifyToken(chatv2);
        console.log('cookie check->', result);

        if(result === null){
            if(req.path === '/login' || req.path === '/signup'){
                return next();
            }else{
                return res.redirect('/login');
            }
        }else{
            if(req.path === '/login'){
                return res.redirect('/');
            }else{
                next();
            }
        }
    });

    let default_router = require('./router/default_router')(app, wrap, root_dirname);
    
    app.use(function(err, req, res, next){
        console.log("< Error Handler >")
        console.log(err);
        res.json(err);
    });

    

    return app;
}