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

.controller('MyOrdersCtrl', [ '$scope', 'orders',

function($scope, orders) {

	$scope.orders = orders;
	// show more or less orders.
	$scope.showOrdersDefault = 10;
	$scope.showAllOrdersButton = true;
	$scope.showOrderButtons = ($scope.orders.length >= $scope.showOrdersDefault);
	$scope.showOrdersFilter = $scope.showOrdersDefault;

} ]);
