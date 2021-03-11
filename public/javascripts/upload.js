const mapContainer = document.getElementById("map");
const mapOption = {
  center : new daum.maps.LatLng(37.554477, 126.970419),
  level : 3,
};

let map = new daum.maps.Map(mapContainer, mapOption);

let infowindow = new daum.maps.InfoWindow({
  zIndex : 1,
});

let markerList = [];

let ps = new daum.maps.services.Places(); //키워드로 검색

searchPlaces();  //키워드를 받고, 검색하는 함수

function searchPlaces(){
  let keyword = $("#keyword").val();
  ps.keywordSearch(keyword, placesSearchCB);
}

//검색결과를 호출해주는 함수.
function placesSearchCB(data, status){
  if(status === daum.maps.services.Status.OK){
    displayPlaces(data);  //리스트로 반환하는 함수
    console.log(data);
  }else if(status === daum.maps.services.Status.ZERO_RESULT){
    alert("검색결과가 존재하지 않습니다.");
    return;
  }else if(status === daum.maps.services.Status.ERROR){
    alert("검색결과중 오류가 발생했습니다.");
    return;
  }
}

function displayPlaces(data){
  let listEl = document.getElementById("placesList");  //결과값이 들어갈 자리
  let bounds = new daum.maps.LatLngBounds(); //검색후의 영역표시

  removeAllChildNodes(listEl); //검색결과 최신화
  removeMarker();

  for (let i = 0; i < data.length; i++){
    let lat = data[i].y;
    let lng = data[i].x;
    let address_name = data[i]["address_name"];
    let place_name = data[i]["place_name"];

    //위도와 경도를 지도에 맞게 변환
    const placePosition = new daum.maps.LatLng(lat, lng);
    bounds.extend(placePosition);

    let marker = new daum.maps.Marker({
      position : placePosition,
    });
  
    marker.setMap(map);
    markerList.push(marker);

    //결과값을 List로 표현
    const el = document.createElement("div");
    const itemStr = `
      <div class="info">
        <div class="info_title">
          ${place_name}
        </div>
        <span>${address_name}</span>
      </div>
    `;

    el.innerHTML = itemStr;
    el.className = "item";

    //marker클릭 시, Info 열리고 닫히는 코드
    daum.maps.event.addListener(marker, "click", function(){
      displayInfowindow(marker, place_name, address_name, lat, lng);
    });
  
    daum.maps.event.addListener(map, "click", function(){
      infowindow.close();
    });

    el.onclick = function(){
      displayInfowindow(marker, place_name, address_name, lat, lng);
    };

    listEl.appendChild(el);
  }
  map.setBounds(bounds);
}

function displayInfowindow(marker, title, address, lat, lng){

  let content = `
    <div style="padding:25px;">
      ${title}<br>
      ${address}<br>
      <button onClick="onSubmit('${title}', '${address}', ${lat}, ${lng});">등록</button>
    </div>
  `;

  //Info를 보여줄때, 그 위치로 이동.
  map.panTo(marker.getPosition());
  infowindow.setContent(content);
  infowindow.open(map, marker);
}

function removeAllChildNodes(el){
  while(el.hasChildNodes()){
    el.removeChild(el.lastChild);
  }
}

function removeMarker(){
  for(let i=0; i < markerList.length; i++){
    markerList[i].setMap(null);
  }
  markerList = [];
}


//등록하기
function onSubmit(title, address, lat, lng){
 $.ajax({
    url : "/location",
    data: {title, address, lat, lng},
    type: "POST",
 }).done((response) => {
   console.log("데이터 요청 성공");
   alert("位置が登録されました。");
 }).fail((error) => {
   console.log("데이터 요청 실패");
   alert("실패!");
 }); 
}
