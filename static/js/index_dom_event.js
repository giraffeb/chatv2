//init
function init(){
    socket.emit('hello');
}

function Message(){
    this.chatroom_id=null;
    this.sender=null;
    this.receiver=null;
    this.reg_date = Date.now();
    this.message=null;
};

//#0 logout
function logout(){
    let logout_btn = document.getElementById('logout');
    logout_btn.onclick = (event)=>{
        console.log('logout call');
        window.open('/logout', '_self');
    }
}

//#1. 친구 등록은 여러 단계로 나뉨.

async function add_friend(){
    
    let result;
    let input_ele = document.getElementById("find_friend");
    
    input_ele.onkeyup = (event)=>{
        let friend_id;
        if(event.key === "Enter"){
            console.log('event call');
            friend_id = event.srcElement.value;
            friend_id = friend_id.trim().replace('\n', '');
            //event 
            add_friend_event(friend_id);
            input_ele.value = "";
        }
    } 
}
//find_friend()종속
async function add_friend_event(friend_id){
    console.log('fetch -> ', friend_id);
    let response = await fetch('/friend'
                    , {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                          },
                        method: "POST"
                        , body: JSON.stringify({friend_id: friend_id})
                        }
                    );
    
    let result;
    
    if(response.ok){
        result = await response.json();
        console.log('find_friend->', result);
        socket.emit('add_friend', friend_id);
    }else{
        result = await response.json();
        console.log('find_friend->', result);
        console.log('not found user');
        alert('해당 유저가 존재하지 않습니다.');
        return;
    }

    let friend_li_element = create_friend_element(friend_id);

    let friend_list_element = document.getElementById('friend_list');
    friend_list_element.append(friend_li_element);
}

function create_friend_element(friend_id){
    let friend_li_element = document.createElement('li');
    friend_li_element.innerHTML = friend_id;
    friend_li_element.onclick = get_chatroom_event;
    return friend_li_element;
}


//걍
async function get_friend_list(){
    let current_user = JSON.parse(sessionStorage.getItem("currentUser"));
    let response = await fetch('/friend/'+current_user.user_id, {method: "GET"});
    let friend_id_list = null;

    if(response.ok){
        friend_id_list = await response.json();
        console.log('friend_id_list->', friend_id_list);
        let friend_list_element = document.getElementById('friend_list');
        friend_list_element.innerHTML="";

        if(friend_id_list !== null){
            friend_id_list.map((user_id)=>{
                let friend_li_element = create_friend_element(user_id);
                friend_list_element.append(friend_li_element);
            });
        } 
    }
    return friend_id_list;
}

async function init_get_chatroom_event(friend_id){
    // let friend_id = event.srcElement.innerHTML;
    console.log('init_get_chatroom->', friend_id);
    let result;

    // let friend_id = event.srcElement.innerHTML;
    let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    
    if(response.ok){
        result = await response.json();
        sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
    }else{
        console.log('채팅방을 가져오지 못했습니다.');
        alert('채팅방을 가져오지 못했습니다.');
        return ;
    }
    
    return result;
}

async function get_chatroom_event(event){
    console.log('get_chatroom_event call it');
    let friend_id = event.srcElement.innerHTML;
    let exist_result;
    let message_list;

    let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    
    if(response.ok){
        result = await response.json();
        sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
    }else{
        console.log('채팅방을 가져오지 못했습니다.');
        alert('채팅방을 가져오지 못했습니다.');
        return ;
    }

    try{
        //indexedDB에서 가져오십시오.
        message_list = await loadMessageFromDB(friend_id);    
    }catch(e){
        console.log('get_chatroom_event catch');
        return;
    }

    // console.log('exist_result->', exist_result);
    // // let message_list = await load_chat_message_from_indexeddb(friend_id);
    // console.log(message_list);

    draw_chatroom(message_list);
}

async function get_chatroom_event_by_friend_id(friend_id){
    console.log('get_chatroom_event call it');
    let exist_result;
    let message_list;

    let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    
    if(response.ok){
        result = await response.json();
        sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
    }else{
        console.log('채팅방을 가져오지 못했습니다.');
        alert('채팅방을 가져오지 못했습니다.');
        return ;
    }

    try{
        //indexedDB에서 가져오십시오.
        message_list = await loadMessageFromDB(friend_id);    
    }catch(e){
        console.log('get_chatroom_event catch');
        return;
    }

    // console.log('exist_result->', exist_result);
    // // let message_list = await load_chat_message_from_indexeddb(friend_id);
    // console.log(message_list);

    draw_chatroom(message_list);
}


//TODO: 메시지 표현 형식 구현해야 합니다.
function create_message_element(message){
    let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
    let message_li = document.createElement('li');

    let sender_span = document.createElement('span');
    if(message.sender === current_user_id){
        sender_span.innerHTML = "나";
    }else{
        sender_span.innerHTML = message.sender;
    }
    
    let reg_date_span = document.createElement('span');
    let formatted_date = new Date(message.reg_date).toLocaleString('ko-KR').substr(13);
    reg_date_span.innerHTML = "("+formatted_date+"): "
    let message_span = document.createElement('span');
    message_span.innerHTML = message.message;
    
    message_li.append(sender_span);
    message_li.append(reg_date_span);
    message_li.append(message_span);

    return message_li;
};

function draw_chatroom(message_list){
    let chatroom_title = document.getElementById("chatroom_title");
    let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    let currentChatRoom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
    let title = "";
    if(currentUser.user_id === currentChatRoom.sender){
        title = currentChatRoom.receiver;
    }else{
        title = currentChatRoom.sender;
    }
    
    chatroom_title.innerHTML = title;
    console.log('draw chatroom call it');
    
    let chat_area = document.getElementById('chat_area');
    let chat_list = document.getElementById('chat_list');
    chat_list.innerHTML = "";

    for(let message of message_list){
        console.log(message);
        let message_li = create_message_element(message);
        chat_list.append(message_li);
    }

    chat_list.scrollTop = chat_list.scrollHeight;
}

function draw_message(message){
    let chat_area = document.getElementById('chat_area');
    let chat_list = document.getElementById('chat_list');
    let message_li = create_message_element(message);
    
    chat_list.append(message_li);
    chat_list.scrollTop = chat_list.scrollHeight;
    console.log("chat_list.scrollTop->", chat_list.scrollTop);
    console.log("chat_list.scrollHeight->", chat_list.scrollHeight);
}

//이벤트 등록
logout();
add_friend();
send_message_event();


//chatting messgae 보내기
function send_message_event(){
    
    let chat_input_textarea = document.getElementById('chat_input_textarea');
    chat_input_textarea.onkeyup = async (event)=>{
        if(event.key === "Enter"){
            console.log('send message event call it');
            let value = event.srcElement.value;
            value = value.trim().replace('\n', '');
            
            let message = create_message(value);
            socket.emit('message', message);    
            draw_message(message);
            console.log(message);
            chat_input_textarea.value="";
            saveMessageToDB(message);
            
        }
    }
}

function create_message(msg){
    let current_user = JSON.parse(sessionStorage.getItem("currentUser"));
    let current_chatroom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
    let message = new Message();
    message.chatroom_id = current_chatroom._id;
    message.sender = current_user.user_id;
    message.message = msg;
    message.receiver = current_chatroom.receiver;
    
    return message;
}

///
socket.on('hello', async function(data){
    console.log('hello');
    dexie_db = new Dexie("chatv2");
    sessionStorage.setItem("currentUser", JSON.stringify(data));
    let friend_id_list = await get_friend_list();
    let current_user_id = data.user_id;
    initDatabase_config(current_user_id);
    await initDatabase(friend_id_list);
    
    if(friend_id_list.length > 0){
        let current_friend = friend_id_list[0];
        get_chatroom_event_by_friend_id(current_friend);
    }
    
})


socket.on('message', function(msg){
    //어떤 유저에게 왔는지, 현재 채팅방에 저장해야합니다.
    console.log('receive message');
    
    let current_chatroom = JSON.parse(sessionStorage.getItem("currentChatRoom"));
    let current_user = JSON.parse(sessionStorage.getItem("currentUser"));

    /**
     * 클라이언트에 저장된 회원정보 중
     * 친구목록에 없는 사용자로부터 메시지가 올 경우 <- 새로운 친구가 추가되었고 상대방이 메시지를 보냈다는 의미이므로.
     */
    let f = current_user.friend_list.filter((friend_id)=>{
        if(friend_id === msg.sender){
            return true;
        }
    });

    if(f.length === 0){
        get_friend_list();
    }
    
    if(msg.chatroom_id == current_chatroom._id){
        draw_message(msg);
        saveMessageToDB(msg);
    }else{
        saveMessageToDB(msg);
    }
})

