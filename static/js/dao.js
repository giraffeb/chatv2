
/**
 * 채팅 메시지 를 보내거나 받을때 로컬 기록용.
 * @param {Message} message 
 */



function save_chat_message_to_indexeddb(message){
    
    return new Promise((resolve, reject)=>{
        console.log('message->', message );
        let current_user = JSON.parse(sessionStorage.getItem("currentUser"));
        let object_store_name;    

        if(message.sender === current_user.user_id){
            //내가 보내는 메시지.
            object_store_name = message.receiver;
        }else{
            //받은 메시지
            object_store_name = message.sender;
        }

        let app_db_name = "chatv2";
        let request = window.indexedDB.open(app_db_name+current_user.user_id);
        
        /**
         * 기존에 채팅방 object_store를 이용하는 경우.
         * 
         */
        request.onsuccess = function(event){     
            console.log('indexed db onsuccess.');
            let db = event.target.result;
            let currnet_db_version = db.version;
            
            let object_store_exist_flag = db.objectStoreNames.contains(object_store_name);
            
            if(object_store_exist_flag){
                let transaction = db.transaction([object_store_name], "readwrite");
                
                console.log('message.receiver->', object_store_name);
                let object_store = transaction.objectStore(object_store_name);
                object_store.add(message);

                transaction.oncomplete = function(event){
                    console.log('transaction oncomplete');
                }
                
                transaction.onerror = function(event){
                    console.log('transaction error.');
                }
            }else{
                console.lo
                let new_request = window.indexedDB.open(app_db_name+current_user.user_id, currnet_db_version+1);

                new_request.onupgradeneeded = function(event){
                    console.log('indexed db onupgradeneeded.');
                    console.log(event);
                    let db = event.target.result;
                    let current_version = db.version;
                    
                    console.log('version ->', db.version);
            
                    // let transaction = db.transaction([message.receiver], "readwrite");
                    // let new_request = window.indexedDB.open(app_db_name+user_id, current_version+1);
                    console.log('message.receiver->', object_store_name);
                    let object_store = db.createObjectStore(object_store_name, {keyPath: "reg_date"});
                    object_store.add(message);
            
                    object_store.onsuccess = function(){
                        console.log("save object store complete");
                    }
                }
            }
        }

        request.onerror = function(err){
            console.log('indexed db error was occufied.');
            console.log(err);
        }

        /**
         * 기존 채팅방이 없어서 새롭게 채팅방 object_store를 만들때 발생 이벤트.
         */
        request.onupgradeneeded = function(event){
            console.log('indexed db onupgradeneeded.');
            console.log(event);
            let db = event.target.result;
            let current_version = db.version;
            
            console.log('version ->', db.version);

            // let transaction = db.transaction([message.receiver], "readwrite");
            // let new_request = window.indexedDB.open(app_db_name+user_id, current_version+1);
            console.log('message.receiver->', object_store_name);
            let object_store = db.createObjectStore(object_store_name, {keyPath: "reg_date"});
            object_store.add(message);

            object_store.onsuccess = function(){
                console.log("save object store complete")
            }
        }
    })
    
}//END: save message


//메시지 꺼내오기
function load_chat_message_from_indexeddb(friend_id){
    return new Promise((resolve, reject)=>{
        console.log('friend_id->', friend_id);
        let db_name = "chatv2";
        let user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
        let request = window.indexedDB.open(db_name+user_id);
        let chat_list_result = [];
        
        request.onsuccess = async function(event){
            console.log("load chat requet success.");
            
            let db = event.target.result;
            
            let transaction = db.transaction([friend_id], "readwrite");

            transaction.onerror = function(event){
                console.log('transaction error;')
            }
    
            let object_store = transaction.objectStore(friend_id);
            let result = object_store.openCursor();

            result.onsuccess = async function(event){
                let cursor = event.target.result;
                console.log("cursor result onsuccess");
                
                if(cursor){
                    // console.log(cursor.value);
                    chat_list_result.push(cursor.value);
                    cursor.continue();
                }else{
                    console.log("cursor end");
                }
            }        

            transaction.oncomplete = function(event){
                console.log("complete transaction load message from indexedDB");
                resolve(chat_list_result);

            }
        }
        
        
        request.onerror = function(event){
            console.log("error occufied from request");
            
        }    

    });
    
}

function check_chatroom_exist(friend_id){
    
    return new Promise((resolve, reject)=>{
        let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
        let db_name = 'chatv2';
        
        let request = window.indexedDB.open(db_name+current_user_id);
        
        
        request.onsuccess = function(evnet){
            console.log("database success");

            let db = event.target.result;
            let transcation;
            try{
                transaction = db.transaction(friend_id, "readwrite");
            }catch(e){
                console.log('catch exception');
                return reject(e);
            }
            
            let object_store = transaction.objectStore(friend_id);

            transaction.abort = function(event){
                console.log("transaction error");
                reject(event);
            }

            transaction.oncomplete = function(event){
                console.log("transaction complete");
                resolve(event);
            }

        }
        
        request.onerror = function(event){
            console.log("database connect error");
            reject(event);
        }
    });
 
}

function mycreateObjectStore(friend_id){
    console.log("createObjectStore");
    return new Promise((resolve, reject)=>{
        let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
        let db_name = 'chatv2';
        let request = window.indexedDB.open(db_name+current_user_id);
    
        request.onsuccess = function(event){
            console.log('create object store onsuccess');

            let db = event.target.result;
            let current_version = db.version;

            new_request = window.indexedDB.open(db_name+current_user_id, current_version+1);
            new_request.onupgradeneeded = function(event){
                console.log("new_request version change fired")
                let new_db = event.target.result;
                new_db.createObjectStore(friend_id);

                new_db.onsuccess = function(){

                }

                new_db.onclose = function(event){
                    console.log("new_Db on close");
                }
            }
            
            
        }

        request.onupgradeneeded = function(event){

            console.log('create object store new onupgradeneeded');
            console.log(event);
            let new_db = event.target.result;
            new_db.createObjectStore(friend_id, {keyPath: "reg_date"}); 
            // resolve(event);
        }

        request.onerror = function(event){
            console.log("create object request error");
            reject(event);
        }

        request.onclose = function(event){
            console.log("request complete");
        }

    });
}

function get_last_message(friend_id){
    return new Promise((resolve, reject)=>{
        let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
        let db_name = 'chatv2';    
        let request = window.indexedDB.open(db_name+current_user_id);
        let last_message;

        request.onsuccess = function(event){
            let db = event.target.result;
            let transaction;
            try{
                transaction = db.transaction(friend_id, "readwrite");
            }catch(e){
                console.log('catch it');
                return reject(e);
            }

            let object_store = transaction.objectStore(friend_id);
            let object_store_request = object_store.openCursor();
            
            object_store_request.onsuccess = function(event){
                let cursor = event.target.result;

                if(cursor){
                    last_message = cursor.value;
                    cursor.continue();
                }else{
                    console.log('cursor close');
                }
            }

            transaction.oncomplete = function(event){
                resolve(last_message);
            }
        
        }
        request.onerror = function(event){
            reject('request error');   
        }
    });
    
    
}


/**
 * #인덱스 디비 정책 
 * 
 * #1. 기존 인덱스 디비에 유저의 데이터가 저장되어 있는지 확인합니다.
 * #1-1. 있으면 가져와서 뿌립니다.
 * #1-2. 없으면 생략
 * #2. 서버에서 선택한 유저의 채팅방을 가져옵니다.
 * #2-1. 채팅방의 채팅 내역과 현재 저장된 디비의 내용을 확인합니다. (기존 디비 없으면 생략)
 * #3. 가져온 내용을 채팅방에 표시합니다.
 * #4. 채팅방은 토글-> 현재 채팅방과 요청하는 방이 같다면 요청을 보내지 않는다. -> 이게 서비스 워커 캐쉬랑 같은건가.
 * 
 */

 /**
  * 데이터 베이스 존재 여부 확인.
  * 
  */

  async function test(para){
    try{
        let result = await get_last_message(para);
        console.log(result);
    }catch(e){
        console.log(e);
    }
  }