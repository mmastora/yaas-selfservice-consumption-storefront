'use strict';
angular
.module('ds.communities.controllers',[])
.controller('CommunitiesWidgetController',function($scope,$rootScope){
  $scope.$on('COMM_INIT_OK', function(data,args){
    var options = {};
    jQuery.extend(options,args);
    options.checkLogin = function(){
      return {
        Token: this.token,
        UserId: this.userId
      };
    }.bind(options);
    options.doLogin = jQuery.noop;
    options.communicationMode = 'UseToken';
    if (Excelsior) {
      Excelsior.init(options);
    }
    Excelsior.ready(function(){
      Excelsior.setSearchKeyword(options.searchString);
      Excelsior.render({
          id: ['cFacetNav','cSearchRes'],
          name: 'SearchCommunity'
      });
    });
  });
});
