

var dexie_db;
var db_config;

function initDatabase_config(current_user_id){
    // let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
    let db_name_prefix = "chatv2";
    let message_schema = new Message();
    
    let schme_string="";
    for(let key in message_schema){
        console.log('key->', key);
        if(key === "reg_date"){
            schme_string = key+","+schme_string    
        }
        schme_string += key+","
    }
    console.log(schme_string);
    schme_string = schme_string.substr(0, schme_string.length-1);

    db_config = {
        db_name: db_name_prefix+current_user_id,
        message_schema: schme_string
    }
    console.log(db_config.message_schema);
}

/**
 * 기존에 테이블이 정의 되어 있다면 테이블 정의는 제외하는 기능.
 * @param {} friend_id_list 
 */
async function dbAndTableCheck(friend_id_list){
    console.log(friend_id_list);
    let result_friend_id_list=[];
    let dexie_db = await new Dexie(db_config.db_name).open();   
    let table_name_list = dexie_db.tables.map((table)=>{
        return table.name;
    });

    let len = friend_id_list.length;
    if(len == 0){
        
        return result_friend_id_list;       
    }else{
        let flag = true;
        for(let friend_id of friend_id_list){
            console.log('friend_id->', friend_id);
            for(let table_name of table_name_list){
                console.log('table_name->', table_name);
                if(friend_id === table_name){
                    flag = false;
                    break;
                }
            }
            if(flag === true){
                result_friend_id_list.push(friend_id);
            }
        }
    }
    return result_friend_id_list;
}

async function isDatabase(){
    let database_exist_flag = false;
    
    try{
        let db = await new Dexie(db_config.db_name).open();
        database_exist_flag = true;
        db.close();
    }catch(e){
        console.log(e);
    }
    return database_exist_flag;
}

async function checkNewTable(friend_id_list){
    let new_table_list = [];

    try{
        let db = await new Dexie(db_config.db_name).open();
        let flag = true;
        table_list = db.tables;

        for(let friend_id of friend_id_list){
            for(let table of table_list){
                if(friend_id === table.name){
                    falg = false;
                    break;
                }
            }
            if(flag === true){
                new_table_list.push(friend_id);
            }
        }
        db.close();
    }catch(e){
        console.log(e);
    }
    console.log("new_table_list->", new_table_list);
    return new_table_list;
}

async function getDatabaseVersion(){
    let db = await new Dexie(db_config.db_name).open();
    let db_version = db.verno;
    db.close();

    return db_version;
}

function setMessageSchema(message){
    let dexie_schema = "";

    for(let key in message){
        if(key === "reg_date"){
            dexie_schema = key+","+dexie_schema
        }
        dexie_schema += key+","
    }
    dexie_schema = dexie_schema.substr(0, dexie_schema.length-1);
    return dexie_schema;
}

function setStore(new_table_list, message_obj){
    let result = {};

    for(let table_name of new_table_list){
        result[table_name] = setMessageSchema(message_obj);
    }

    return result;
}

async function initDatabase(friend_id_list){
    let database_exist_flag = await isDatabase();
    let new_table_list = friend_id_list;
    let db_version = 1;
    
    if(database_exist_flag === true){
        new_table_list = await checkNewTable(friend_id_list);
        db_version = getDatabaseVersion();
    }
    
    
    let db = new Dexie(db_config.db_name);
    let store_ob = setStore(new_table_list, new Message());
    db.version(db_version).stores(store_ob);

    //TODO: 메시지 넣는 과정. 서버에서 메시지 가져오는 기능이 구현되어 해야함.
    for(let friend_id of friend_id_list){
        let chatroom = await init_get_chatroom_event(friend_id);
        console.log("chatroom->", chatroom);
        db[friend_id].bulkPut(chatroom.chat_list);
    }

    db.close();
}

async function saveMessageToDB(message_obj){
    let current_user_id = JSON.parse(sessionStorage.getItem("currentUser")).user_id;
    
    console.log("current_user_id->", current_user_id);
    console.log("message->", message_obj);
    let table_name;
    if(current_user_id === message_obj.sender){
        table_name = message_obj.receiver;
    }else{
        table_name = message_obj.sender;
    }
    
    let db_version = dexie_db.verno;
    console.log(dexie_db);
    console.log('table_name->', table_name);
    dexie_db = await new Dexie(db_config.db_name).open();
    
    await dexie_db.table(table_name).put(message_obj);
    dexie_db.close();
}


async function loadMessageFromDB(friend_id){
    dexie_db = await new Dexie(db_config.db_name).open();
    let result = await dexie_db.table(friend_id).toArray();    
    dexie_db.close();
    return result;
}


async function syncTest(friend_id){
    let response = await fetch('/chatroom/'+friend_id,{mehtod: "GET"});
    let result;
    if(response.ok){
        result = await response.json();
        console.log('sync test get result->', result);
        sessionStorage.setItem('currentChatRoom', JSON.stringify(result));
    }else{
        console.log('채팅방을 가져오지 못했습니다.');
        alert('채팅방을 가져오지 못했습니다.');
        return;
    }


    dexie_db = await new Dexie(db_config.db_name).open();
    let res = await dexie_db.table(friend_id).bulkPut(result.chat_list);

    dexie_db.close();
}