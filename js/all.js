const main = document.querySelector('main');
const citySelect = document.querySelector('.js-citySelect');
const keywordSearch = document.querySelector('.js-keywordSearch');
const searchBtn = document.querySelector('.js-searchBtn');
const attractionsList = document.querySelector('.js-attractionsList');
const searchNum = document.querySelector('.js-searchNum');
const pagination = document.querySelector('.js-pagination');
const attractionInfo = document.querySelector('.js-attractionInfo');
const typeBtnList = document.querySelectorAll('.js-typeBtnArea button');
const searchScope = document.querySelector('.js-searchScope');
const searchNearbyBtn = document.querySelector('.js-searchNearbyBtn');
const nearbyResultArea = document.querySelector('.js-nearbyResultArea');

const headersObj = {
  headers: getAuthorizationHeader()
}

//加密API ID 及 KEY
function getAuthorizationHeader() {
  let AppID = '755697d0b2f0417aafae1ea0ab32aabd';
  let AppKey = 'W3SEuohsCIF8QP398KJ1frhXk4k';
  let UTCString = new Date().toUTCString();
  let ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update(`x-date: ${UTCString}`);
  let HMAC = ShaObj.getHMAC('B64');
  let Authorization = `hmac username="${AppID}", algorithm="hmac-sha1", headers="x-date", signature="${HMAC}"`;
  return { 'Authorization': Authorization, 'X-Date': UTCString };
}
let cityName = '';
switch (main.dataset.page) {
  case 'index':
    let cityData = [];
    let cityNameArr = [];
    let keyword = '';
    let searchResult = [];
    const paginationData = {};
    let pagesNum = 0;
    //index載入渲染
    function indexInit() {
      citySelectInit();
    }
    indexInit();
    //縣市選單渲染
    function citySelectInit() {
      axios.get('https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON', headersObj)
        .then((res) => {
          cityData = res.data;
          renderCitySelect();
        })
    }
    function renderCitySelect() {
      let str = `<option value="" selected disabled>請選擇縣市</option>`;
      cityData.forEach((item) => {
        str += `<option value="${item.City}">${item.CityName}</option>`
      })
      citySelect.innerHTML = str;
    }
    //搜尋功能
    citySelect.addEventListener('change', changeCityName);
    function changeCityName(e) {
      cityName = e.target.value;
    }
    searchBtn.addEventListener('click', searchAttractions);
    function searchAttractions() {
      keyword = keywordSearch.value.trim();
      switch (cityName !== '' && keyword !== '') {
        case true:
          getAllSearchData();
          break;
      }
    }
    //取得所有搜尋資料
    function getAllSearchData() {
      axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot/${cityName}?$filter=contains(Name, '${keyword}')&$format=JSON`, headersObj)
        .then((res) => {
          let dataLength = res.data.length;
          pagesNum = Math.ceil(dataLength / 12);
          pageSearchResult();
          getPagination();
          renderPagination();
          searchNum.textContent = `共 ${dataLength} 筆資料`;
        })
    }
    //取得第一頁資料
    function pageSearchResult(page = 1) {
      let skipNum = (page - 1) * 12;
      axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot/${cityName}?$filter=contains(Name, '${keyword}')&$top=12&$skip=${skipNum}&$format=JSON`, headersObj)
      .then((res) => {
        searchResult = res.data;
        renderSearchResult();
      })
    }
    //取得分頁資料
    function getPagination(page = 1) {
      paginationData.pagesNum = pagesNum;
      paginationData.current = page;
      paginationData.pre = paginationData.current !== 1;
      paginationData.next = paginationData.current < paginationData.pagesNum;
    }
    //將搜尋結果渲染到網頁上
    function renderSearchResult() {
      let str = '';
      searchResult.forEach((item) => {
        str += `<li>
            <a class="card h-100" href="javascript:;" data-id="${item.ID}">
              <span class="tag">${item.City}</span>
              <div class="pictureArea">
                <img class="picture ${item.Picture.PictureUrl1 === undefined ? 'd-none' : ''}" src="${item.Picture.PictureUrl1}" alt="${item.Picture.PictureDescription1}">
                <div class="noPicture ${item.Picture.PictureUrl1 === undefined ? 'd-flex' : 'd-none'} flex-column jc-center ai-center">
                  <span class="material-icons fs-1">
                    image_not_supported
                  </span>
                  <p class="fs-4 fw-bold">沒有圖片</p>
                </div>
              </div>
              <div class="infoArea p-4">
                <h2 class="fs-5 fw-bold text-center">${item.Name}</h2>
              </div>
            </a>
          </li>`
      })
      attractionsList.innerHTML = str;
    }
    //渲染分頁區塊
    function renderPagination() {
      let pagesNum = paginationData.pagesNum;
      let pageArr = [];
      for (let i = 1; i <= pagesNum; i++) {
        pageArr.push(i);
      }
      let str = `<li><a class="${paginationData.pre ? '' : 'disabled'} d-flex jc-center ai-center bg-dark text-white" href="javascript:;" data-btn="pre">
            <span class="material-icons d-block">
              chevron_left
            </span>
          </a></li>`;
      pageArr.forEach((item) => {
        str += `<li><a class="${paginationData.current === item ? 'active disabled' : ''} d-flex jc-center ai-center text-white" href="javascript:;" data-btn="${item}">${item}</a></li>`;
      })
      str += `<li><a class="${paginationData.next ? '' : 'disabled'} d-flex jc-center ai-center bg-dark text-white" href="javascript:;" data-btn="next">
              <span class="material-icons d-block">
                chevron_right
              </span>
            </a></li>`;
      pagination.innerHTML = str;
    }
    //切換頁分頁
    pagination.addEventListener('click', changePagination);
    function changePagination(e) {
      let paginationLink = e.target.closest('a');
      switch (paginationLink) {
        case null:
          break;
        default:
          switch (paginationLink.classList.contains('disabled')) {
            case true:
              break;
            case false:
              let page = '';
              switch (paginationLink.dataset.btn) {
                case 'pre':
                  page = paginationData.current - 1;
                  break;
                case 'next':
                  page = paginationData.current + 1;
                  break;
                default:
                  page = parseInt(paginationLink.dataset.btn);
                  break;
              }
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
              getPagination(page);
              renderPagination();
              pageSearchResult(page);
              break;
          }
          break;
      }
    }
    //點選景點卡片切換網頁
    attractionsList.addEventListener('click', toAttractionPage);
    function toAttractionPage(e) {
      let cardLink = e.target.closest('a');
      switch (cardLink) {
        case null:
          break;
        default:
          let attractionUrl = `attraction.html?id=${cardLink.dataset.id}&city=${cityName}`;
          window.location = attractionUrl;
          break;
      }
    }
    break;
  case 'attraction':
    let data = {};
    let type = 'Hotel';
    let position = {};
    let distance = 0;
    let nearbyData = [];
    function attractionInit() {
      let url = location.href;
      let parameterArr = url.split('?')[1].split('&');
      let id = parameterArr[0].split('=')[1];
      cityName = parameterArr[1].split('=')[1];
      axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot/${cityName}?$filter=contains(ID, '${id}')&$format=JSON`, headersObj)
        .then((res) => {
          data = res.data[0];
          position = res.data[0].Position;
          renderAttractionInfo();
        })
    }
    attractionInit();
    //渲染景點資訊
    function renderAttractionInfo() {
      let str = `<h2 class="fs-3 fw-bold text-center mt-6 mb-4">${data.Name}</h2>
      <div class="d-flex d-block-lg">
        <div class="pictureArea ${data.Picture.PictureUrl1 === undefined ? 'd-none' : ''}">
          <img class="picture" src="${data.Picture.PictureUrl1}" alt="${data.Picture.PictureDescription1}">
        </div>
        <div class="infoArea ${data.Picture.PictureUrl1 === undefined ? 'full' : ''}">
          <p class="mb-1">${data.DescriptionDetail}</p>
          <div class="d-flex mb-1">
            <p>電話：<span class="${data.Phone === undefined ? 'd-block' : 'd-none'}">未提供</span></p>
            <a class="fw-bold opacity-hover ${data.Phone === undefined ? 'd-none' : 'd-block'}" href="tel:${data.Phone}">${data.Phone}</a>
          </div>
          <div class="d-flex mb-1">
            <p class="d-flex text-nowrap">網址：<span class="${data.WebsiteUrl === undefined ? 'd-block' : 'd-none'}">未提供</span></p>
            <a class="url fw-bold opacity-hover ${data.WebsiteUrl === undefined ? 'd-none' : 'd-block'}" href="${data.WebsiteUrl}">${data.WebsiteUrl}</a>
          </div>
        </div>
      </div>`;
      attractionInfo.innerHTML = str;
    }
    typeBtnList.forEach((item) => {
      item.addEventListener('click', changeTypeBtn);
    })
    function changeTypeBtn(e) {
      typeBtnList.forEach((item) => {
        item.classList.remove('active');
      })
      e.target.classList.add('active');
      type = e.target.dataset.type;
    }
    //選擇搜尋範圍
    searchScope.addEventListener('change', changeSearchScope);
    function changeSearchScope(e) {
      distance = e.target.value;
    }
    //搜尋周圍地標按鈕功能
    searchNearbyBtn.addEventListener('click', searchNearby);
    function searchNearby() {
      switch (distance) {
        case 0:
          alert('請選擇搜尋範圍！');
          break;
        default:
          axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/${type}/${cityName}?&$spatialFilter=nearby(${position.PositionLat}, ${position.PositionLon}, ${distance})&$format=JSON`)
            .then((res) => {
              nearbyData = res.data;
              renderSearchNearbyResult();
            })
          break;
      }
      //渲染周邊地標搜尋結果
      function renderSearchNearbyResult() {
        let str = [];
        switch (nearbyData.length) {
          case 0:
            str = `<tr>
            <td class="noResult" colspan="4">
              附近沒有地標，請更換搜尋目標或範圍！
            </td>
          </tr>`;
            break;
          default:
            nearbyData.forEach((item) => {
              str += `<tr>
              <td width="20%">${item.Name}</td>
              <td width="15%"><a class="fw-bold opacity-hover ${item.Phone === undefined ? 'd-none' : 'd-block'}" href="${item.Phone}">${item.Phone}</a><p class="${item.Phone === undefined ? 'd-block' : 'd-none'}">未提供</p></td>
              <td width="35%">${item.Address}</td>
              <td width="30%"><a class="url fw-bold opacity-hover ${item.WebsiteUrl === undefined ? 'd-none' : 'd-block'}" href="${item.WebsiteUrl}">${item.WebsiteUrl}</a><p class="${item.WebsiteUrl === undefined ? 'd-block' : 'd-none'}">未提供</p></td>
            </tr>`;
            })
            break;
        }
        nearbyResultArea.innerHTML = str;
      }
    }
    break;
}
