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

angular.module('ds.support').controller('SupportCtrl', [ '$scope', 'GlobalData', '$translate', '$http', 'SupportSvc', 'CommunitiesSvc', '$stateParams', '$location', '$state', '$modal', 'AuthSvc', 'AuthDialogManager', 'SiteConfigSvc', 'OrderListSvc', 'Notification', '$rootScope', '$window', 'settings',

function($scope, GlobalData, $translate, $http, SupportSvc, CommunitiesSvc, $stateParams, $location, $state, $modal, AuthSvc, AuthDialogManager, siteConfig, OrderListSvc, Notification, $rootScope, $window, settings) {
	$scope.supportSvc = SupportSvc;
	$scope.user = GlobalData.user;
	$scope.supportSvc.productRegisterErrorMessage = SupportSvc.productRegisterErrorMessage;
	SupportSvc.setProductRegErrorMessage('');
	$scope.PLACEHOLDER_IMAGE = settings.placeholderImage;
	$scope.isAuthenticated = function() {
		return AuthSvc.isAuthenticated();
	};

	// $scope.modalInstance;
	$scope.stateParams = $stateParams;
	if ($scope.stateParams.scanObjectData === undefined && $location.$$url !== undefined && $location.$$url !== '') {
		var url = $location.$$url.toLocaleLowerCase();

		if (url.indexOf('qrscan') > -1 && url.indexOf('qrscan') > -1) {
			var scanParms = $location.$$search;
			var fnkeysToLowerCase = function(obj) {
				var keys = Object.keys(obj);
				var n = keys.length;
				while (n--) {
					var key = keys[n];
					if (key !== key.toLowerCase()) {
						obj[key.toLowerCase()] = obj[key];
						delete obj[key];
					}
				}
				return (obj);
			};
			scanParms = fnkeysToLowerCase(scanParms);

			var scanObject = null;
			if (scanParms !== undefined && scanParms.qrscan !== undefined && scanParms.productid !== undefined) {
				if (scanParms.qrscan === 'true' && scanParms.productid !== '') {
					// Yes search for QR scan product
					scanObject = scanParms;
					scanObject.firstload = true;
					scanObject.qrscan = true;
					$scope.stateParams.scanObjectData = scanObject;
				} else {
					if (scanParms.productid !== '') {
						return SupportSvc.cecenterSearchProduct({
							q : '*' + scanParms.productid + '*',
							topNumberofHits : 5
						}).then(function(results) {
							if (results.length >= 1) {
								scanObject = scanParms;
								scanObject.firstload = false;
								scanObject.qrscan = false;
								$scope.stateParams.scanObjectData = scanObject;
							}
						});
					}
				}
			}
		}
	}

	// Communities TODO: Finalize builder config read
	/*
	 * CommunitiesSvc.one('configuration').get().then(function(){ debugger; });
	 */

	// show tickets if stateparams are set
	var activaTab = function(tab) {
		$('.nav-tabs a[href="#' + tab + '"]').tab('show');
	};

	if ($stateParams.action === 'showTickets') {
		activaTab('myServiceTickets');
	}

	// get all the stores
	$scope.stores = [];

	$scope.signIn = function() {

		var dlg = AuthDialogManager.open({
			windowClass : 'mobileLoginModal'
		}, {}, {}, true);

		dlg.then(function() {
			if (AuthSvc.isAuthenticated()) {
				// window.location.reload();

			}
		}, function() {
			Notification.error({
				message : $translate.instant('AUTHENTICATION_FAILURE'),
				delay : 3000
			});
		});

	};

	// login user check ends

	$scope.navigateToregisterProduct = function() {
		// $state.go('base.support.registerProduct', { productId: "123"});
		$scope.productRegisterErrorMessage1 = '';
		var errorMsg = '';
		$scope.newProductRegistration = {
			'createdBy' : '',
			'customerId' : '',
			'purchasedDate' : '',
			'id' : '',
			'productId' : '',
			'productSerialNo' : '',
			'storeId' : $scope.productStoreModel
		};
		if (!$scope.supportSvc.selectedProduct) {
			// show alert to select a product
			errorMsg = $translate.instant('SELECT_PRODUCT_ERROR');
			SupportSvc.setProductRegErrorMessage(errorMsg);
			// $scope.supportSvc.productRegisterErrorMessage = errorMsg;
			$scope.productRegisterErrorMessage = errorMsg;
			var thisDiv = $('#messageAlertSupportScreen');
			thisDiv.removeClass();
			thisDiv.addClass('alert alert-warning');

			return;
		}
		$scope.selProduct = $scope.supportSvc.selectedProduct;
		// set the selected product data
		$scope.selectedProductId = $scope.selProduct.id;
		if ($scope.selProduct.media.length > 0) {
			$scope.selectedProductImage = $scope.selProduct.media[0].url;
		} else {
			$scope.selectedProductImage = $scope.PLACEHOLDER_IMAGE;
		}
		$scope.selectedProductName = $scope.selProduct.name;
		$scope.isSupportProduct = (function() {
			if ($scope.selProduct.mixins !== null && $scope.selProduct.mixins !== undefined && $scope.selProduct.mixins.ssrvcext !== null && $scope.selProduct.mixins.ssrvcext !== undefined && $scope.selProduct.mixins.ssrvcext.isRegisterable !== null && $scope.selProduct.mixins.ssrvcext.isRegisterable !== undefined) {
				return $scope.selProduct.mixins.ssrvcext.isRegisterable === true;
			}
			return false;
		}());

		// check if product can be registered
		if (!$scope.isSupportProduct) {
			errorMsg = $translate.instant('SELECT_REGISTERABLE_PRODUCT_ERROR');
			$scope.productRegisterErrorMessage = errorMsg;
			return false;
		}

		if (!$scope.isAuthenticated()) {

			var dlg = AuthDialogManager.open({
				windowClass : 'mobileLoginModal'
			}, {}, {}, true);

			dlg.then(function() {
				if (AuthSvc.isAuthenticated()) {
					$scope.launchModalWindow('CreateProdReg');
				}
			}, function() {
				Notification.error({
					message : $translate.instant('AUTHENTICATION_FAILURE'),
					delay : 3000
				});
			});
		} else {
			$scope.launchModalWindow('CreateProdReg');
		}
	};

	$scope.registerProduct = function() {
		// Chek here if this product is supported
		// $scope.isSupportProduct

		// check date and do other checks
		var errorMsg = '';
		$scope.productRegisterErrorMessage1 = errorMsg;

		if ($scope.newProductRegistration.productSerialNo === null || $scope.newProductRegistration.productSerialNo === undefined || $scope.newProductRegistration.productSerialNo.length === 0) {
			errorMsg = $translate.instant('VALID_SERIAL_ERROR');
			// SupportSvc.setProductRegErrorMessage(errorMsg);
			$scope.productRegisterErrorMessage1 = errorMsg;
			return;
		}
		$scope.datePurchased = new Date($scope.newProductRegistration.purchasedDate);
		var thisDate = $scope.datePurchased;
		var now = new Date();
		if (!thisDate instanceof Date || isNaN(thisDate.valueOf())) {
			errorMsg = $translate.instant('VALID_DATE_ERROR');
			// SupportSvc.setProductRegErrorMessage(errorMsg);
			$scope.productRegisterErrorMessage1 = errorMsg;
			return;
		}

		if (thisDate > now) {
			errorMsg = $translate.instant('VALID_DATE_ERROR');
			$scope.productRegisterErrorMessage1 = errorMsg;
			return;
		}

		console.log($scope.newProductRegistration.purchasedDate);
		$scope.newProductRegistration = {
			'createdBy' : GlobalData.customerAccount.id,
			'customerId' : GlobalData.customerAccount.id,
			'datePurchased' : $scope.datePurchased.toISOString(),
			'id' : Math.floor((1 + Math.random()) * 0x1000000000000000),
			'productId' : $scope.supportSvc.selectedProduct.id,
			'productSerialNo' : $scope.newProductRegistration.productSerialNo,
			'storeId' : $scope.productStoreModel

		};

		SupportSvc.registerNewProduct($scope.newProductRegistration).then(function(results) {
			console.log('fired new product registration');
			$scope.modalInstance.close();
			$state.go('base.support.registrations');
			var curDate = new Date().toISOString();
			var newProductRegId = results.id;
			// fire interaction log
			var param = {
				'communicationDirection' : 'INBOUND',
				'communicationDirectionDescription' : {
					'en' : 'Inbound'
				},
				'communicationOrigin' : 'STOREFRONT',
				'communicationOriginDescription' : {
					'en' : 'Storefront'
				},
				'customerId' : GlobalData.customerAccount.id,

				'interactionDescription' : 'Customer has performed Product Registration',
				'interactionEndedAt' : curDate,
				'interactionReasons' : [ {
					'description' : {
						'en' : 'Product-Related Registration'
					},
					'interactionReason' : 'ZPRODUCT_REGISTRATION'
				} ],
				'interactionStartedAt' : curDate,
				'metadata' : {
					'createdAt' : curDate,
					'modifiedAt' : curDate,
					'version' : 1
				},
				'relatedObjects' : [ {
					'objectName' : $scope.supportSvc.selectedProduct.name,
					'objectType' : 'ZPRODUCT_REGISTRATION',
					'objectId' : newProductRegId
				} ]
			};
			SupportSvc.createNewInteractionLog(param).then(function() {
				console.log('new interactionLog created');
			}, function() {
				Notification.error({
					message : $translate.instant('INTERACTION_LOG_FAILURE'),
					delay : 3000
				});
			});

			// interaction log ends
			Notification.success({
				message : $translate.instant('PRODUCT_REGISTERED_SUCCESS'),
				delay : 3000
			});
		}, function() {
			if (error.status === 409) {
				Notification.error({
					message : $translate.instant('PRODUCT_SUPPORT_ID_ALREADY_EXISTS'),
					delay : 3000
				});
			} else {
				Notification.error({
					message : $translate.instant('PRODUCT_REGISTERED_FAILURE'),
					delay : 3000
				});
			}
		});

	};
	// comment
	$scope.cancel = function() {
		$scope.modalInstance.close();
		$scope.cleanUp();
	};
	$scope.gotoChat = function() {
		$state.go('base.support.chat');
	};
	$scope.gotoMySupportTickets = function() {
		if (!$scope.isAuthenticated()) {
			var dlg = AuthDialogManager.open({
				windowClass : 'mobileLoginModal'
			}, {}, {}, true);

			dlg.then(function() {
				if (AuthSvc.isAuthenticated()) {

					$state.go('base.support.tickets');
				}
			}, function() {
				Notification.error({
					message : $translate.instant('AUTHENTICATION_FAILURE'),
					delay : 3000
				});
			});

		} else {

			$state.go('base.support.tickets');
		}
	};

	$scope.gotoMySupportProdRegs = function() {
		if (!$scope.isAuthenticated()) {
			var dlg = AuthDialogManager.open({
				windowClass : 'mobileLoginModal'
			}, {}, {}, true);

			dlg.then(function() {
				if (AuthSvc.isAuthenticated()) {

					$state.go('base.support.registrations');
				}
			}, function() {
				Notification.error({
					message : $translate.instant('AUTHENTICATION_FAILURE'),
					delay : 3000
				});
			});

		} else {

			$state.go('base.support.registrations');
		}

	};

	$scope.gotoMyOrders = function() {
		$state.go('base.myorders');
	};

	$scope.navigateToCreateServiceTicket = function() {

		// set the selected product data
		if ($scope.supportSvc.selectedProduct) {
			$scope.selProduct = $scope.supportSvc.selectedProduct;
			// set the selected product data
			$scope.selectedProductId = $scope.selProduct.id;
			if ($scope.selProduct.media.length > 0) {
				$scope.selectedProductImage = $scope.selProduct.media[0].url;
			} else {
				$scope.selectedProductImage = $scope.PLACEHOLDER_IMAGE;
			}
			$scope.selectedProductName = $scope.selProduct.name;
			$scope.isSupportProduct = (function() {
				var mixinKeys = Object.getOwnPropertyNames($scope.selProduct.mixins);
				for (var i = 0; i < mixinKeys.length; i++) {
					if (mixinKeys[i].indexOf('ssrvc') > -1) {
						return $scope.selProduct.mixins[mixinKeys[i]].isRegisterable === true;
					}
				}

				return false;
			})();

		} else {
			$scope.selectedProductId = '';
			$scope.selectedProductImage = '';
			$scope.selectedProductName = '';
		}

		// TODO: Handle Translations
		$scope.serviceProductDefStatus = 'Open';

		$scope.serviceTypeDefault = 'GENERAL_INQUIRY';

		$scope.newServiceTicket = {
			'type' : 'SERVICE_REQUEST',
			'status' : 'OPEN',
			'customerId' : '',
			'productId' : $scope.selectedProductId,
			'shortDescription' : '',
			'createdBy' : ''
		};

		if (!$scope.isAuthenticated()) {
			var dlg = AuthDialogManager.open({
				windowClass : 'mobileLoginModal'
			}, {}, {}, true);

			dlg.then(function() {
				if (AuthSvc.isAuthenticated()) {

					$scope.launchModalWindow('CreateServiceTicket');
				}
			}, function() {
				Notification.error({
					message : $translate.instant('AUTHENTICATION_FAILURE'),
					delay : 3000
				});
			});

		} else {

			$scope.launchModalWindow('CreateServiceTicket');
		}
	};
	$scope.createNewServiceTicket = function() {

		$scope.newServiceTicket.customerId = GlobalData.customerAccount.id;
		$scope.newServiceTicket.createdBy = GlobalData.customerAccount.id;

		SupportSvc.createNewServiceTicket($scope.newServiceTicket).then(function(serviceTicketId) {
			$state.go('base.support.tickets');
			Notification.success({
				message : $translate.instant('SERVICE_TICKET_CREATION_SUCCESS'),
				delay : 3000
			});
			var curDate = new Date().toISOString();
			// fire interaction log
			var param = {
				'communicationDirection' : 'INBOUND',
				'communicationDirectionDescription' : {
					'en' : 'Inbound'
				},
				'communicationOrigin' : 'STOREFRONT',
				'communicationOriginDescription' : {
					'en' : 'Storefront'
				},
				'customerId' : GlobalData.customerAccount.id,

				'interactionDescription' : 'Customer has created Service Ticket',
				'interactionEndedAt' : curDate,
				'interactionReasons' : [ {
					'description' : {
						'en' : 'Product-Related Registration'
					},
					'interactionReason' : 'ZSELFSERVICE_TICKET'
				} ],
				'interactionStartedAt' : curDate,
				'metadata' : {
					'createdAt' : curDate,
					'modifiedAt' : curDate,
					'version' : 1
				},
				'relatedObjects' : [ {
					'objectType' : 'SAP_SERVICE_TICKET',
					'objectId' : serviceTicketId
				},

				]
			};

			SupportSvc.createNewInteractionLog(param).then(function() {
				console.log('new interactionLog created');
			}, function() {
				Notification.error({
					message : $translate.instant('INTERACTION_LOG_FAILURE'),
					delay : 3000
				});
			});
		}, function() {
			Notification.error({
				message : $translate.instant('SERVICE_TICKET_CREATION_FAILURE'),
				delay : 3000
			});
		});

		$scope.modalInstance.close();
	};
	$scope.initiateTextChat = function() {
		$rootScope.$broadcast('textChatClick', {});
	};
	$scope.initiateVideoChat = function() {
		$rootScope.$broadcast('videoChatClick', {});
	};
	$scope.launchModalWindow = function(modalType) {
		var currentLang = GlobalData.getLanguageCode();
		$scope.serviceTicketTypes = [];
		if (modalType === 'CreateProdReg') {
			$scope.modalInstance = $modal.open({
				templateUrl : './js/app/support/templates/modals/registerProductModal.html',
				scope : $scope,
				backdrop : 'static',
				resolve : {
					stores : [ 'SupportSvc', function(SupportSvc) {
						// get all the stores
						return SupportSvc.getStoresList().then(function(storesPromise) {
							$scope.stores = storesPromise;
							$scope.productStoreModel = storesPromise[0].id;
						});
					} ],
				}
			});
		} else if (modalType === 'CreateServiceTicket') {
			$scope.modalInstance = $modal.open({
				templateUrl : './js/app/support/templates/modals/CreateServiceTicket.html',
				scope : $scope,
				backdrop : 'static',
				size : 'lg',
				resolve : {
					serviceTicketTypes : [ 'SupportSvc', function(SupportSvc) {
						return SupportSvc.getServiceTicketTypes().then(function(results) {
							$scope.serviceTicketTypes = results;
							for (var i = 0; i < results.length; i++) {
								if ($scope.serviceTicketTypes[i].description) {
									if ($scope.serviceTicketTypes[i].description[currentLang]) {
										$scope.serviceTicketTypes[i].description = results[i].description[currentLang];
									}
								}
							}
						});
					} ],
				}
			});
		}

	};
	// Communities
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
	$scope.getCommunitySuggestions = function() {
		if (this.newServiceTicket.shortDescription.length < 3 || !$scope.isCommunitiesEnabled()) {
			$scope.communitySuggestions = [];
			return;
		}
		var rootUrl = settings.communities.communitiesURL + '/api/v1/OData/Networks(\'' + settings.communities.networkName + '\')';
		$.ajax({
			dataType : 'json',
			url : rootUrl + '/ConversationTitleSuggest()?Input=%27' + this.newServiceTicket.shortDescription + '%27&$select=Title,ConversationWebUrl',
		}).done(function(data) {
			$scope.communitySuggestions = data.d.results;
			$scope.$apply();
		}).fail(function() {
			$scope.communitySuggestions = [];
			$scope.$apply();
		});
	};
	$scope.cleanUp = function() {
		if ($scope.communitySuggestions && $scope.communitySuggestions.length) {
			$scope.communitySuggestions = [];
		}
	};
	$scope.getCommunityHomeURL = function() {
		return settings.communities.communitiesURL;
	};
	$scope.showConfirmation = function() {
		$window.clearTimeout($scope.confirmTimeout);
		$scope.confirmTimeout = $window.setTimeout(function() {
			if ($('.form-horizontal').length) {
				$('.overlay-create').show();
			}
		}, 2000);
	};
	$scope.hideConfirmation = function() {
		$('.overlay-create').hide();
	};
	// End Communities
	

	//chat transcripts
	$scope.gotoMyChatTranscripts = function(){
		if (!$scope.isAuthenticated()) {
				var dlg = AuthDialogManager.open({
					windowClass : 'mobileLoginModal'
				}, {}, {}, true);

				dlg.then(function() {
					if (AuthSvc.isAuthenticated()) {

						$state.go('base.support.mychattranscripts');
					}
				}, function() {
					Notification.error({
						message : $translate.instant('AUTHENTICATION_FAILURE'),
						delay : 3000
					});
				});

			} else {

				$state.go('base.support.mychattranscripts');
			}
	}
	//end chat tr
} ]).directive('datepkr', function() {
	return {
		restrict : 'A',
		link : function(scope, elem) {
			elem.datepicker({
				format : 'mm-dd-yyyy',
				maxDate : '+0d',
				autoclose : true,
				minDate : '01/01/1925',
				yearRange : '1925:2050'
			});
		}
	};
});