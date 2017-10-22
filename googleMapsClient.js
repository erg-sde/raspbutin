var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

class GoogleMapClient {

  constructor(){
    this.key = 'AIzaSyDaFyia6M0mj46SGUmiG7HQTz3vJib_1Yk';
  };

  requestPlaceId(query) {
    let base_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?',
    query_str = 'query=' + query + '&', key = 'key=' + this.key;
    xhr.open(base_url + query_str + key).getResponseHeader();
  };
};

let googleMaps = new GoogleMapClient();

let aloha_place_id = googleMaps.requestPlaceId('aloha%20cafe');
