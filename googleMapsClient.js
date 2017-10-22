class GoogleMapClient {

  constructor(){
    this.key = 'AIzaSyDaFyia6M0mj46SGUmiG7HQTz3vJib_1Yk';
    this.request = require('request');
  };

  requestPlaceId(query){

    'https://maps.googleapis.com/maps/api/place/nearbysearch/json?query='+ query +
    'key='+ this.key
  };

  requestDirections(){

  };
};
