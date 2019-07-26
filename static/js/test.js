
/**
 * 사용자가 ui에서 입력함
 * 엘리먼트로부터 이벤트 발생
 * 발생한 이벤트를 처리
 * 서버에 요청하기도 하고
 * 반환값을 가져오기도함
 * 그리고 다시 그려냄.
 * 
 */

 /**
  * socket.io를 사용해서 서버와 통신하며
  * 하나의 element에서 발새하는 이벤트를 처리하고 타겟 element에 수행을 하는 간단한 클래스입니다.
  * 기본적인 작동의 인터페이스만 구현되고, 
  */
 class Feature{

    /**
     * 
     * @param {*} socket_io_object 
     */
    constructor(socket_io_object){
        this.feature_name = feature_name;
        this.socket = socket_io_object;
        this.socket_event_name;
        this.event_src_element;
        this.event_type;
        this.target_element;
        this.event_handler;
        this.event_receiver;
    }

    start(){
        this.add_element_event();
        this.receive_socket_event(); 
    }
    //이벤트 연결
    add_element_event(){
        this.event_src_element
                .addEventListner(this.event_type, this.event_handler);
    }
    //소켓 이벤트 수신.
    receive_socket_event(){
        this.socket
                .on(this.socket_event_name, this.event_receiver);    
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let find_friend_feature = new Feature(socket);

find_friend_feature.event_src_element=document.getElementById("find_friend");
find_friend_feature.event_type="click";
find_friend_feature.event_handler=function(event){
    if(event.key === "Enter"){
        let value = event.srcElement.value;
        let friend_id = value.trim().replace('\n','');
        console.log('friend_id->', friend_id);

        //친구찾기 api 요청하기 여기서는 socket.io쓰자.
        //가져와서 그리기.
        socket.emit('find_friend', friend_id);
    }  
}

find_friend_feature.event_receiver=function(user_obj){
    if(user_obj === null){
        console.log('해당 친구를 찾지 못했습니다.');
    }
    //response 찾기 존재하면 그리기
    console.log()
    let friend_list = document.querySelector(".border_box.friend_list");
    let ele = create_friend_id_element(user_obj.user_id);
    friend_list.append(ele);
    
    //response 찾기 존재 안하면 아무 액션 없음.
};


/////////
/**
 * 이처리의 목적이 뭐지 내 생각엔 그냥 엘리먼트랑 이벤트 등록을 간단하게 정리하고 싶었던 건데 그게 아니네?
 * 프레임워크를 지금 왜 만들고 앉았어? ㅅㅂ
 * \
 * 엘리먼트에서 이벤트를 등록하고
 * 서버랑 이벤트 수신하고
 * 가져온 데이터르 기반으로 엘리먼트를 만들고
 * 새로만든 엘리먼트에 이벤트를 넣거나 말거나 이거네?
 * 엘리먼트받고 엘리먼트 생성하고
 * 
 */