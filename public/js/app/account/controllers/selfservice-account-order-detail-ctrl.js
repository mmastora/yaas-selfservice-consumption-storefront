//SelfService Controller for Order Details Page
//Included Product Registration on the Sales Order

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

angular.module('ds.account').controller('SelfserviceAccountOrderDetailCtrl', [ '$scope', 'order', '$stateParams', 'GlobalData', 'SupportSvc', '$modal', 'AuthSvc', '$state', 'Notification', '$translate', 'AuthDialogManager', 'settings', function($scope, order, $stateParams, GlobalData, SupportSvc, $modal, AuthSvc, $state, Notification, $translate, AuthDialogManager, settings) {
	$scope.supportSvc = SupportSvc;
	$scope.isAuthenticated = AuthSvc.isAuthenticated();
	$scope.user = GlobalData.user;
	$scope.order = order;
	$scope.order.id = $stateParams.orderId;
	$scope.currencySymbol = GlobalData.getCurrencySymbol($scope.order.currency);
	$scope.dateFormat = 'dd/MM/yy';
	var date = new Date(order.created);
	$scope.selectedProd = '';
	$scope.orderDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
	$scope.PLACEHOLDER_IMAGE = settings.placeholderImage;

	$scope.isAuthenticated = function() {
		return AuthSvc.isAuthenticated();
	};

	var getPaymentInfo = function() {
		return $scope.order.payments[0];
	};

	var getItemsOrderedCount = function() {
		var count = 0;
		angular.forEach(order.entries, function(entry) {
			count += entry.amount;
		});
		return count;
	};
	$scope.itemCount = getItemsOrderedCount();
	$scope.payment = getPaymentInfo();

	$scope.cancelOrder = function() {
		$modal.open({
			templateUrl : 'js/app/account/templates/dialogs/order-cancel-dialog.html',
			controller : 'OrderCancelDialogCtrl',
			backdrop : 'static',
			resolve : {
				order : function() {
					return order;
				}
			}
		}).result.then(function(response) {
			$scope.order.status = response.status;
		});
	};

	$scope.showCancelBtn = function(order) {
		if (!!order.status && (order.status === 'CREATED' || order.status === 'CONFIRMED')) {
			return true;
		} else {
			return false;
		}
	};

	// Product Registration on Order Details Page
	$scope.navigateToRegProduct = function(selectedProduct) {
		// $state.go('base.support.registerProduct', { productId: "123"});
		$scope.productRegisterErrorMessage1 = '';
		$scope.newProductRegistration = {
			'createdBy' : '',
			'customerId' : '',
			'purchasedDate' : '',
			'id' : '',
			'productId' : '',
			'productSerialNo' : '',
			'storeId' : $scope.productStoreModel
		};
		$scope.selectedProd = selectedProduct;
		console.log($scope.selectedProd);

		if (!selectedProduct) {
			// show alert to select a product
			var errorMsg = $translate.instant('SELECT_PRODUCT_ERROR');
			SupportSvc.setProductRegErrorMessage(errorMsg);
			// $scope.supportSvc.productRegisterErrorMessage = errorMsg;
			$scope.productRegisterErrorMessage = errorMsg;
			var thisDiv = $('#messageAlertSupportScreen');
			thisDiv.removeClass();
			thisDiv.addClass('alert alert-warning');

			return;
		}

		// set the selected product data

		$scope.selectedProductId = selectedProduct.product.id;
		if (selectedProduct.product.images.length > 0) {
			$scope.selectedProductImage = selectedProduct.product.images[0].url;
		}
		$scope.selectedProductName = selectedProduct.product.name;

		// check if product can be registered

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

	$scope.registerProduct = function(productID) {
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
		if (!thisDate instanceof Date || isNaN(thisDate.valueOf())) {
			errorMsg = $translate.instant('VALID_DATE_ERROR');
			// SupportSvc.setProductRegErrorMessage(errorMsg);
			$scope.productRegisterErrorMessage1 = errorMsg;
			return;
		}

		console.log($scope.newProductRegistration.purchasedDate);
		$scope.newProductRegistration = {
			'createdBy' : GlobalData.customerAccount.id,
			'customerId' : GlobalData.customerAccount.id,
			'datePurchased' : $scope.datePurchased.toISOString(),
			'id' : Math.floor((1 + Math.random()) * 0x1000000000000000),
			'productId' : productID,
			'productSerialNo' : $scope.newProductRegistration.productSerialNo,
			'storeId' : $scope.productStoreModel

		};

		SupportSvc.registerNewProduct($scope.newProductRegistration).then(function(results) {
			console.log('fired new product registration');
			$scope.modalInstance.close();
			// $state.go('base.support.registrations');
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
					'objectName' : $scope.selectedProd.product.name,
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
			Notification.error({
				message : $translate.instant('PRODUCT_REGISTERED_FAILURE'),
				delay : 3000
			});
		});

	};
	// comment
	$scope.cancel = function() {
		$scope.modalInstance.close();
	};
	$scope.launchModalWindow = function(modalType) {

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
		}
	};
} ]);