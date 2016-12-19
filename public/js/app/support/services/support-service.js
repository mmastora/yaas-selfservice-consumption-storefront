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

/**
 * Encapsulates access to the SelfService APIs.
 */
angular.module('ds.support')
    .factory('SupportSvc', ['SupportREST', '$q', '$state',function(SupportREST, $q,$state){

        this.selectedProduct = null;
        this.productRegisterErrorMessage = null;

        var getRegisteredProducts = function (parms) {
            return SupportREST.ProductSupport.all('productRegistrations').getList(parms);
        };

        var createNewProductRegistration = function(newProductReg){
            //TODO: get all product registration for this logged in user and then add new one.
            var promise = SupportREST.ProductSupport.all('productRegistrations').customPOST(newProductReg);

            return promise;
            
        };
        var getSelectedProduct = function () {
            return this.selectedProduct;
        };
        var getSupportTickets = function(params){
            return SupportREST.SeSeCECenterMashUp.all('serviceTickets').getList(params);
        };
        var cecenterSearchProduct = function(params){
            return SupportREST.CECenterProductSearch.all('/product/search').getList(params);
        };

        var cecenterTicketDetail = function(param){
              return SupportREST.SeSeCECenterMashUp.one('serviceTickets/' + param).get();
        };

        var createNewServiceTicket = function(params){
             var promise = SupportREST.SeSeCECenterMashUp.all('serviceTickets').customPOST(params);
             return promise;
        };

        var getServiceTicketTypes = function(){
            return  SupportREST.SeSeCECenterMashUp.one('serviceTicketTypes').getList();
        };

        var updateServiceTicket = function(params){
             return SupportREST.SeSeCECenterMashUp.one('serviceTickets/' + params.id).customPUT(params);
        };

         var createNewInteractionLog = function(params){
              
              var intLogDef = $q.defer();
                SupportREST.SeSeCECenterMashUp.all('interactionLogs').customPOST(params).then(function(){
                    intLogDef.resolve({});
                }, function (error) {
                    intLogDef.reject(error);
                    $state.go('base.support.registrations');
                     
                });
                return intLogDef.promise;
        };
        var getChatTranscripts = function (params) {
           return SupportREST.SeSeCECenterMashUp.all('interactionLogs').getList(params);
        };
        
        return {
            /**
             * Retrieves product registration list based on provided parameters (filter)
             * @param {parms} query parameters
             */
            getRegisteredProducts: function(parms) {
                return getRegisteredProducts(parms);
            },
            registerNewProduct:function(param){
                return createNewProductRegistration(param);
            },
            getStoresList: function(){
                var storesPromise = SupportREST.ProductSupport.all('stores').getList();
                return storesPromise;
            },
            setSelectedProduct: function(param) {
                this.selectedProduct = param;
            },
            getSelectedProduct : function() {
                return getSelectedProduct();
            },
            setProductRegErrorMessage: function(param) {
                this.productRegisterErrorMessage = param;
            },
            getSupportTickets:function(params){
                return getSupportTickets(params);

            },
            cecenterSearchProduct: function(params) {
                return cecenterSearchProduct(params);
            },
            createNewServiceTicket:function(params){
                return createNewServiceTicket(params);
            },
            getCECenterTicketDetail:function(param){
                return cecenterTicketDetail(param);
            },
            getServiceTicketTypes:function(){
                return getServiceTicketTypes();
            },
            updateServiceTicket:function(param){
                return updateServiceTicket(param);
            },
            getServiceTicketStatus:function(){
                 return  SupportREST.SeSeCECenterMashUp.one('serviceTicketStatus').getList();
            },
            getChatTranscripts:function(params){
                 return  getChatTranscripts(params);
            },
            createNewInteractionLog:function(params){
                return createNewInteractionLog(params);
            }
        };

    }]);