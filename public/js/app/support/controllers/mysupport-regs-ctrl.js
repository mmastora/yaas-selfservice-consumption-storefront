/**
 * [y] hybris Platform
 * 
 * Copyright (c) 2000-2015 hybris AG All rights reserved.
 * 
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the license
 * agreement you entered into with hybris.
 */
'use strict';

angular.module('ds.support')

.controller('MySupportRegsCtrl', [ '$scope', 'GlobalData', '$translate', '$http', 'SupportSvc', '$stateParams', '$location', '$state', 'SiteConfigSvc', 'productRegistrations', '$window', 'settings',

function($scope, GlobalData, $translate, $http, SupportSvc, $stateParams, $location, $state, siteConfig, productRegistrations, $window, settings) {

	$scope.productRegistrations = productRegistrations;
	$scope.PLACEHOLDER_IMAGE = settings.placeholderImage;
	$scope.isCommunitiesEnabled = function() {
		// return CommunitiesSvc.isCommunitiesEnabled();
		var flag = false;
		var cSettings = settings.communities;
		flag |= cSettings.networkName.replace(/\s+/g, '') !== '';
		flag &= cSettings.communitiesURL.replace(/\s+/g, '') !== '';
		return flag;
	};
	$scope.openCommunitiesWidget = function(searchString) {
		var cWin = $window.open('./js/app/support/templates/CommunitiesWidget.html');
		var appRoot;
		var wtf = setInterval(function() {
			appRoot = cWin.angular.element('.app-root');
			if (appRoot) {
				var cWinScope = appRoot.scope();
				if (cWinScope) {
					$window.clearInterval(wtf);
					cWinScope.$broadcast('COMM_INIT_OK', {
						networkSlug : settings.communities.networkName,
						server : settings.communities.communitiesURL,
						userId : settings.communities.userId,
						token : settings.communities.token,
						searchString : searchString
					});
				}
			}
		}, 100);
	};

} ]);