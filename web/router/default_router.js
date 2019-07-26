module.exports = function(app, wrap, root_dirname){
    let mongoose = require('mongoose');
    let User = require(root_dirname+'/db/models/user');    
    let ChatRoom = require(root_dirname+'/db/models/chatroom');    
    let jwt = require(root_dirname+'/util/jwt');

    app.get('/', wrap(async (req,res,next)=>{
        res.sendFile(root_dirname+"/html/index.html");
    }));

    app.get('/login', wrap(async function(req, res, next){
        res.sendFile(root_dirname+"/html/login.html");
    }));

    app.post('/login', wrap(async function(req, res, next){
        console.log('login process');
        console.log(req.body);

        let user_id = req.body.user_id;
        let password = req.body.password;

        let result = await User.findOne({user_id: user_id});
        console.log('findOne() result->', result);
        if(result === null){
            console.log('login failed');
            return res.redirect('/login');
        }

        let token = jwt.signinToken(result);
        res.cookie("chatv2", token);

        res.redirect('/');
    }));

    app.get('/signup', wrap(async function(req, res, next){
        res.sendFile(root_dirname+"/html/signup.html");
    }));

    app.post('/signup', wrap(async function(req, res, next){
        console.log("signup process");
        console.log(req.body);
    
        let user_id = req.body.user_id;
        let password = req.body.password;

        let new_user = new User();
        new_user.user_id = user_id;
        new_user.password = password;

        //validation이 없습니다.
        let result = await new_user.save();
        console.log('save() result-> ',result);
        
        res.redirect('/login');
    }));


    app.get('/logout', wrap(async function(req, res, next){
        console.log('logout call it');
        console.log('cookie', req.cookies.chatv2);
        res.clearCookie('chatv2');
        res.redirect('/');
    }));


    app.get('/user/:user_id', wrap(async function(req,res,next){
        let user_id = req.params.user_id;
        console.log('/user:user_id ->',user_id);

        let result = await User.findOne({user_id: user_id});
        res.json(result);
    }));

    /**
     * 해당 채팅방을 달라고 할뿐임.
     * 그뿐입니다.
     */
    app.get('/chatroom/:friend_id', wrap(async function(req, res, next){
        let friend_id = req.params.friend_id;
        console.log('friend_id ->', friend_id);
        let current_user_id = jwt.verifyToken(req.cookies.chatv2).user_id;

        let current_chatroom = await ChatRoom.findOne({$or: [{sender: friend_id, receiver: current_user_id}, {receiver: friend_id, sender: current_user_id}]});
        if(current_chatroom === null){
            console.log('target chatroom not exist.');
            //현재 채팅방이 없다면 생성합니다
            let friend_user = await User.findOne({user_id: friend_id});

            if(friend_user === null){
                res.status(500).json({result: "friend_id is not exist"});
            }else{
                console.log('found friend and create chatroom.');
                let current_user_id = jwt.verifyToken(req.cookies.chatv2).user_id;
                let new_chatroom = await new ChatRoom();
                new_chatroom.sender = current_user_id;
                new_chatroom.receiver = friend_id;
                let result_chatroom = await new_chatroom.save();
                res.json(result_chatroom);
            }
        }else{
            res.json(current_chatroom);
        }

    }));

    //친구 추가
    app.post('/friend', wrap(async function(req, res, next){
        console.log('친구 추가 호출');
        console.log('body->', req.body);
        
        let current_user_id = jwt.verifyToken(req.cookies.chatv2).user_id;
        console.log("current_user_id->", current_user_id);
        let target_friend_id = req.body.friend_id;
        console.log("target_friend_id->", target_friend_id);
        
        let friend_user = await User.findOne({user_id: target_friend_id});
        if(friend_user === null){
            res.status(500).json({result: "친구 대상 유저가 존재하지 않습니다."})
        }else{
            let current_user = await User.findOne({user_id: current_user_id});
            let friend_list_checked = current_user.friend_list.filter((cur_friend_id)=>{
                if(cur_friend_id === target_friend_id){
                    return true;
                }else{
                    return false;
                }
            });

            if(friend_list_checked.length > 0){
                //이미 추가된 친구입니다.
                res.status(500).json({result: "이미 추가된 친구입니다."});
            }else{
                current_user.friend_list.push(target_friend_id);
                friend_user.friend_list.push(current_user_id);
                
                let result = await current_user.save();
                friend_user.save();
                console.log("친구 추가 완료.");

                let new_chatroom = await new ChatRoom();
                new_chatroom.sender = current_user_id;
                new_chatroom.receiver = target_friend_id;
                let result_chatroom = await new_chatroom.save();
                
                res.json(result);
            }
        }

    }));

    //친구 목록 가져오기
    app.get('/friend/:user_id', wrap(async function(req, res, next){
        let user_id = req.params.user_id;

        let current_user = await User.findOne({user_id: user_id});
        let friend_list = current_user.friend_list;
        console.log('friend_list->', friend_list);

        let result_friend_list = await User.find({user_id: {$in: friend_list}});
        console.log('result_friend_list->', result_friend_list);
        if(result_friend_list.length > 0 ){
            let result = result_friend_list.map((user)=>{
                return user.user_id;
            });
            res.json(result);
        }else{
            res.json(null);
        }
        
    }))
};