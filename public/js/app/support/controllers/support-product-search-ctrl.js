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

angular.module('ds.support').controller('SupportProductSearchCtrl', [ '$scope', '$rootScope', '$state', 'settings', '$filter', 'ProductSvc', 'SupportSvc', '$translate', function($scope, $rootScope, $state, settings, filter, ProductSvc, SupportSvc, $translate) {
	if (!$scope.page) {
		$scope.page = 0;
	}
	if (!$scope.searchString) {
		$scope.searchString = '';
	}
	$scope.search = {
		results : [],
		numberOfHits : 0,
		showSearchResults : false,
		searchAvailable : false,
		searchError : false,
		zeroResults : false
	};
	SupportSvc.setSelectedProduct(null);
	$scope.yglyphiconVisible = false;
	$scope.searchProduct = function() {
		if ($scope.searchString) {
			// var queryParam = +"*&";
			SupportSvc.cecenterSearchProduct({
				q : '*' + $scope.searchString.toString() + '*',
				topNumberofHits : 5
			}).then(function(results) {
				/*
				 * if(results.query !== $scope.searchString) { return; }
				 */
				// Hide error only when search was ok
				$scope.search.searchError = false;
				// $scope.search.numberOfHits = results.nbHits;
				$scope.search.results = results;
				$scope.search.searchError = false;
				$scope.search.showSearchResults = true;
				if (results.length === 0) {
					$scope.search.zeroResults = true;
				} else {
					$scope.search.zeroResults = false;
				}
				// Used to apply changes for showSearchResults
				if (!$scope.$$phase) {
					$scope.$digest();
				}
			}, function() {
				// Show error that search didn't perform correctly.
				$scope.search.searchError = true;
			});
		} else {
			$scope.showSearchResults = false;
			$scope.searchResults = [];
			$scope.searchNumberOfHits = 0;
			SupportSvc.setSelectedProduct(null);
			SupportSvc.setSelectedProduct(null);
		}
	};
	$scope.showSearchResults = function() {
		$scope.search.showSearchResults = true;
		if ($scope.searchString !== '') {
			if ($scope.search.results.length === 0) {
				$scope.searchProduct($scope.searchString, 0);
			}
		}
	};
	$scope.selectProduct = function(product) {
		$scope.search.showSearchResults = false; // hide the search results.
		$scope.$parent.productRegisterErrorMessage = '';
		if (!product || product === undefined) {
			// $scope.search.zeroResults = true;
			SupportSvc.setSelectedProduct(null);
			return;
		}
		ProductSvc.querySingleProduct(product.id).then(function(data) {
			SupportSvc.setSelectedProduct(data);
		});
		// SupportSvc.setSelectedProduct(product);
		$scope.searchString = product.name.en; // TODO: hardcoded to english
	};
	// Used for checking if the user left the search field
	var container = angular.element('.y-search');
	var onMouseUpAction = function(e) {
		if (!container.is(e.target) && container.has(e.target).length === 0) {
			// Used to apply changes for showSearchResults
			if (!$scope.$$phase && $scope.search.showSearchResults) {
				$scope.search.showSearchResults = false;
				$scope.$digest();
			}
		}
	};

	if ($scope.stateParams.scanObjectData !== undefined && $scope.stateParams.scanObjectData.firstload === true) {
		if ($scope.stateParams.scanObjectData.qrscan === true) {
			SupportSvc.cecenterSearchProduct({
				q : '*' + $scope.stateParams.scanObjectData.productid + '*',
				topNumberofHits : 5
			}).then(function(results) {
				if (results !== undefined && results.length === 1) {
					ProductSvc.querySingleProduct($scope.stateParams.scanObjectData.productid).then(function(data) {
						$scope.$parent.productRegisterErrorMessage = '';
						var selProduct = data;
						SupportSvc.setSelectedProduct(data);

						if (selProduct.mixins !== null && selProduct.mixins !== undefined && selProduct.mixins.ssrvcext !== null && selProduct.mixins.ssrvcext !== undefined && selProduct.mixins.ssrvcext.isRegisterable !== null && selProduct.mixins.ssrvcext.isRegisterable !== undefined) {
							$scope.$parent.isSupportProduct = (selProduct.mixins.ssrvcext.isRegisterable === true);
						}

						// check if product can be registered
						if (!$scope.$parent.isSupportProduct) {
							var errorMsg = $translate.instant('SELECT_REGISTERABLE_PRODUCT_ERROR');
							$scope.$parent.productRegisterErrorMessage = errorMsg;
							// return false;
						}

						$scope.navigateToregisterProduct();
						$scope.search.showSearchResults = false; // hide the
																	// search
																	// results.
						$scope.stateParams.scanObjectData.firstload = false;
					});
				} else if (results !== undefined && results.length > 1) {
					$scope.searchString = $scope.stateParams.scanObjectData.productid;
					$scope.searchProduct();
					$scope.search.showSearchResults = true; // hide the search
															// results.
					$scope.stateParams.scanObjectData.firstload = false;
				} else {
					$scope.search.showSearchResults = false; // hide the
																// search
																// results.
					$scope.stateParams.scanObjectData.firstload = false;
					return;
				}
			});
		}
	}
	angular.element(document).on('mouseup', onMouseUpAction);
	$scope.$on('$destroy', function() {
		angular.element(document).off('mouseup', onMouseUpAction);
	});
} ]);
