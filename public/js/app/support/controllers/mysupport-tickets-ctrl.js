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

.controller('MySupportTicketsCtrl', [ '$scope', 'GlobalData', '$translate', '$http', 'SupportSvc', '$stateParams', '$location', '$state', '$modal', 'AuthSvc', 'AuthDialogManager', 'SiteConfigSvc', 'OrderListSvc', 'Notification', 'supportTickets',

function($scope, GlobalData, $translate, $http, SupportSvc, $stateParams, $location, $state, $modal, AuthSvc, AuthDialogManager, siteConfig, OrderListSvc, Notification, supportTickets) {

	$scope.supportSvc = SupportSvc;
	$scope.isAuthenticated = AuthSvc.isAuthenticated();
	$scope.user = GlobalData.user;
	$scope.supportSvc.productRegisterErrorMessage = SupportSvc.productRegisterErrorMessage;
	SupportSvc.setProductRegErrorMessage('');

	$scope.modalInstance = null;
	$scope.stateParams = $stateParams;

	// show tickets if stateparams are set
	var activaTab = function(tab) {
		$('.nav-tabs a[href="#' + tab + '"]').tab('show');
	};

	if ($stateParams.action === 'showTickets') {
		activaTab('myServiceTickets');
	}

	// login user check ends
	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
	};

	$scope.openTicketDetails = function(ticketId) {
		// get service ticket details for this ticketId.
		var languageCode = GlobalData.getLanguageCode();
		SupportSvc.getCECenterTicketDetail(ticketId).then(function(result) {
			$scope.ticketDetailObject = result;
			if ($scope.ticketDetailObject.priorityDescription) {
				if ($scope.ticketDetailObject.priorityDescription[languageCode]) {
					$scope.ticketDetailObject.priorityDescription = result.priorityDescription[languageCode];
				}
			}
			if ($scope.ticketDetailObject.productName) {
				if ($scope.ticketDetailObject.productName[languageCode]) {
					$scope.ticketDetailObject.productName = result.productName[languageCode];
				}
			}
			if ($scope.ticketDetailObject.statusDescription) {
				if ($scope.ticketDetailObject.statusDescription[languageCode]) {
					$scope.ticketDetailObject.statusDescription = result.statusDescription[languageCode];
				}
			}
			if ($scope.ticketDetailObject.typeDescription) {
				if ($scope.ticketDetailObject.typeDescription[languageCode]) {
					$scope.ticketDetailObject.typeDescription = result.typeDescription[languageCode];
				}
			}
			$scope.modalInstance = $modal.open({
				templateUrl : './js/app/support/templates/modals/ServiceTicketDetails.html',
				scope : $scope,
				resolve : {
					serviceTicketStatus : [ 'SupportSvc', function(SupportSvc) {
						return SupportSvc.getServiceTicketStatus().then(function(results) {
							$scope.serviceTicketStatus = results;
							for (var i = 0; i < results.length; i++) {
								if ($scope.serviceTicketStatus[i].description) {
									if ($scope.serviceTicketStatus[i].description[languageCode]) {
										$scope.serviceTicketStatus[i].description = results[i].description[languageCode];
									}
								}
							}
						});
					} ],
				},
				backdrop : 'static'
			});
		});
	};
	$scope.confirmTicket = function() {

		$scope.ticketDetailObject.status = 'CONFIRMED';
		var param = $scope.ticketDetailObject;
		SupportSvc.updateServiceTicket(param).then(function() {
			$scope.modalInstance.close();
			// refresh support tickets view

			$scope.refreshTicketsView();

			// refresh ends
			Notification.success({
				message : $translate.instant('SERVICE_TICKET_CONFIRMED_SUCCESS'),
				delay : 3000
			});
		}, function() {
			Notification.error({
				message : $translate.instant('SERVICE_TICKET_CONFIRMED_FAILURE'),
				delay : 3000
			});
		});
	};
	$scope.updateTicket = function() {

		var param = $scope.ticketDetailObject;
		SupportSvc.updateServiceTicket(param).then(function() {
			$scope.modalInstance.close();
			$scope.refreshTicketsView();

			// refresh ends
			Notification.success({
				message : $translate.instant('SERVICE_TICKET_UPDATED_SUCCESS'),
				delay : 3000
			});
		}, function() {
			Notification.error({
				message : $translate.instant('SERVICE_TICKET_UPDATED_FAILURE'),
				delay : 3000
			});
		});
	};
	$scope.cancel = function() {
		$scope.modalInstance.close();
	};
	$scope.refreshTicketsView = function() {
		var parms = {
			pageSize : 50,
			sort : 'metadata.modifiedAt:desc'
		};

		SupportSvc.getSupportTickets(parms).then(function(response) {
			var minfiedServiceTickets = $scope.getMinifiedServiceTickets(response);
			var thisSupportTickets = $scope.filterTickets(minfiedServiceTickets);
			$scope.openServiceTickets = thisSupportTickets.recentOpenItems;
			$scope.closedServiceTickets = thisSupportTickets.recentClosedItems;
		}, function() {
			return [];
		});
	};

	$scope.filterTickets = function(response) {
		var recentOpenItems = [];
		var recentClosedItems = [];
		var thisSupportTickets = {
			'recentOpenItems' : '',
			'recentClosedItems' : ''
		};
		for (var i = 0; i < response.length; i++) {
			if (response[i].status === 'OPEN' || response[i].status === 'IN_PROCESS') {
				recentOpenItems.push(response[i]);
			} else {
				recentClosedItems.push(response[i]);
			}
		}
		thisSupportTickets.recentOpenItems = recentOpenItems;
		thisSupportTickets.recentClosedItems = recentClosedItems;
		return thisSupportTickets;
	};

	$scope.getMinifiedServiceTickets = function(params) {
		var languageCode = GlobalData.getLanguageCode();
		var supportTicketsMinified = params;
		for (var i = 0; i < supportTicketsMinified.length; i++) {
			if (supportTicketsMinified[i].priorityDescription) {
				if (supportTicketsMinified[i].priorityDescription[languageCode]) {
					supportTicketsMinified[i].priorityDescription = params[i].priorityDescription[languageCode];
				}
			}
			if (supportTicketsMinified[i].productName) {
				if (supportTicketsMinified[i].productName[languageCode]) {
					supportTicketsMinified[i].productName = params[i].productName[languageCode];
				}
			}
			if (supportTicketsMinified[i].statusDescription) {
				if (supportTicketsMinified[i].statusDescription[languageCode]) {
					supportTicketsMinified[i].statusDescription = params[i].statusDescription[languageCode];
				}
			}
			if (supportTicketsMinified[i].typeDescription) {
				if (supportTicketsMinified[i].typeDescription[languageCode]) {
					supportTicketsMinified[i].typeDescription = params[i].typeDescription[languageCode];
				}
			}
		}
		return supportTicketsMinified;
	};

	var minfiedServiceTickets = $scope.getMinifiedServiceTickets(supportTickets);
	var thisSupportTickets = $scope.filterTickets(minfiedServiceTickets);
	$scope.openServiceTickets = thisSupportTickets.recentOpenItems;
	$scope.closedServiceTickets = thisSupportTickets.recentClosedItems;

} ]);