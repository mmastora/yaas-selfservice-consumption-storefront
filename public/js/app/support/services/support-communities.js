'use strict';
angular.module('ds.support').factory('CommunitiesSvc', function() {
	return {
		isCommunitiesEnabled: function() {
			//TODO:read configuration from builderUI
			return true;
		},
		getCommunityHomeURL: function(){
			return 'https://cameras59.community-demo.sapjam.com/n/cameras59/home';
		},
		searchFor: function(searchString) {
			$.ajax({
				dataType: 'json',
				url: ''
			}).done(function(data) {

			}).fail(function() {

			});
		},
		suggestPostTitlesFor: function(searchString) {

		}
	};
});
/**
 * angular.module('ds.support').factory('CommunitiesSvc', ['Restangular', 'GlobalData', function(Restangular, GlobalData) {
	return Restangular.withConfig(function(RestangularConfigurer){
		RestangularConfigurer.setBaseUrl('https://api.yaas.io/hybris/sapcommunity/v1/devsese');
		RestangularConfigurer.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
			return {
				element: element,
                params: params,
                headers: _.extend(headers, {'Authorization': 'Bearer 022-29ff9f15-99b1-4536-825e-e62e8c9d6ce9'}),
                httpConfig: httpConfig
            };
        });
	});
}]);
 */