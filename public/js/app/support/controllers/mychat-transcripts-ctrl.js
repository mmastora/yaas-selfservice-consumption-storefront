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

.controller('MyChatTranscriptsCtrl', [ '$scope', 'GlobalData', '$translate', '$http', 'SupportSvc', '$stateParams', '$location', '$state', 'SiteConfigSvc', 'chatTranscripts', '$window', 'settings',

function($scope, GlobalData, $translate, $http, SupportSvc, $stateParams, $location, $state, siteConfig, chatTranscripts, $window, settings) {

	$scope.chatTranscripts = chatTranscripts;

	//test

	var x ={
			  "chatterIds" : [ "C1381590151", "ashish.singh01@sap.com" ],
			  "createdBy" : "ashish.singh01@sap.com",
			  "endAt" : "2016-11-22T06:23:02.000+0000",
			  "id" : "5833e476ecb9ab001d6d3594",
			  "metadata" : {
			    "createdAt" : "2016-11-22T06:23:50.030+0000",
			    "modifiedAt" : "2016-11-22T06:23:50.030+0000",
			    "version" : 1
			  },
			  "startAt" : "2016-11-22T06:22:38.000+0000",
			  "transcript" : [ {
			    "chatContent" : "hi",
			    "createdAt" : "2016-11-22T06:22:58.000+0000",
			    "createdBy" : "ashish.singh01@sap.com"
			  }, {
			    "chatContent" : "dsfds",
			    "createdAt" : "2016-11-22T06:23:02.000+0000",
			    "createdBy" : "ashish.singh01@sap.com"
			  } ]
			};
			
	$scope.chatTranscripts = x.transcript;		
} ]);
