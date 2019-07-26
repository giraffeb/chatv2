module.exports = function(http, wrap){
    let User = require('../db/models/user');
    let ChatRoom = require('../db/models/chatroom');
    let jwt = require('../util/jwt');

    let io = require('socket.io')(http);
    let cookieParser = require('socket.io-cookie-parser');

    io.use(cookieParser());
    
    io.on('connection', function(socket){
        /**
         * 안녕하세요를 수행하면, ㄴㅇㄹ
         */
        socket.on('hello', wrap(async function(data){
            
            console.log('hello new world');
            console.log('data->', data);
            console.log('cookie->', socket.request.cookies.chatv2);
            let token = socket.request.cookies.chatv2;
            //쿠키토큰 인증 후에
            let result = jwt.verifyToken(token);
            console.log(result);
            let current_user = await User.findOne({user_id: result.user_id});
            socket.nickname = current_user.user_id;

            socket.emit('hello', current_user);

            //채팅방을 종료가 불가능하므로.
            //채팅방 기준으로 되어있는데, 채팅방을 만약 카톡처럼 지우고 생성할 수 있다면 다른 방식이 필요
            let chatroom_list = await ChatRoom.find({$or: [{sender: current_user.user_id}, {receiver: current_user.user_id}]});
            
            chatroom_list.map((chatroom)=>{
                console.log('chatroom_id->', chatroom._id);
                socket.join(chatroom._id);
            })
        }));

        socket.on('find_friend', wrap(async function(data){
            let friend_id = data;

            let result = await User.findOne({user_id: friend_id});
            console.log('find_friend->', result);
            if(result === null){
                //어차피 널이지만 명시적으로
                socket.emit('find_friend', null);
            }else{
                socket.emit('find_friend', result);
            }
        }));

        socket.on('get_chatroom', wrap(async function(data){
            
            console.log('data->', data);
            let token = socket.request.cookies.chatv2;
            let result = jwt.verifyToken(token);
            let user_id = result.user_id;
            let friend_id = data;
            let result_chatroom = await ChatRoom.findOne({$or: [{sender:user_id, receiver: friend_id}, {sender:friend_id, receiver: user_id}]});
            console.log('result_chatroom->', result_chatroom);
            if(result_chatroom === null){
                //새로운 방 생성.
                result_chatroom = new ChatRoom();
                result_chatroom.sender = user_id;
                result_chatroom.receiver = friend_id;
                result_chatroom = await result_chatroom.save();
            }

            socket.emit('get_chatroom', result_chatroom);
        }));

        socket.on('message', wrap(async function(data){
            console.log('receive message->', data);

            let result = await ChatRoom.findOne({_id: data.chatroom_id});

            if(result !== null){
                result.chat_list.push(data);
                result = await result.save();
            }
            console.log('result chatroom_id->',result._id);
            
            let temp_list = io.sockets.connected;

            // console.log(io.sockets.connected);
            let target;
            for(let t in io.sockets.connected){
                if(io.sockets.connected[t].nickname === data.receiver){
                    target = io.sockets.connected[t];
                }

            }

            console.log('nickname->',socket.nickname);
            target.join(result._id);
            socket.join(result._id);
            socket.in(result._id).emit('message', data);
            
        }));


        socket.on('disconnecting', function(data){
            console.log("disconnecting call");
            console.log(data);
        })

    });
    

    return io;
}