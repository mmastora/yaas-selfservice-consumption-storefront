/**
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2015 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */

'use strict';

/**
 *  Encapsulates configuration of the price, products, and productDetails APIs.
 */
angular.module('ds.support')
    .factory('SupportREST', ['SiteConfigSvc', 'Restangular', 'GlobalData', function(siteConfig, Restangular, GlobalData){
        function applyLanguageHeader(RestangularConfigurer){
            RestangularConfigurer.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {

                return {
                    element: element,
                    params: params,
                    headers: _.extend(headers, {'Accept-Language': GlobalData.getAcceptLanguages()}, {'hybris-currency': GlobalData.getCurrencyId()}, {'hybris-languages': GlobalData.getAcceptLanguages()}),
                    httpConfig: httpConfig
                };
            });
        }

            return {
               
                /** Endpoint for ProductSupport API. */
                ProductSupport: Restangular.withConfig(function(RestangularConfigurer) {
                    //set the base url
                    RestangularConfigurer.setBaseUrl(siteConfig.apis.productSupport.baseUrl);
                    //add request intereceptor
                    RestangularConfigurer.setResponseInterceptor(function (data, operation, what, url, response) {
                        var headers = response.headers();
                        var result = response.data;
                        if (result){
                            result.headers = headers;
                        }
                        return result;
                    });
                    applyLanguageHeader(RestangularConfigurer);
                }),
                SeSeCECenterMashUp:  Restangular.withConfig(function(RestangularConfigurer) {
                    //set the base url
                    RestangularConfigurer.setBaseUrl(siteConfig.apis.SeSeCECenterMashUp.baseUrl);
                    //add request intereceptor
                    RestangularConfigurer.setResponseInterceptor(function (data, operation, what, url, response) {
                        //var headers = response.headers();
                        var result = response.data;
                        //if (result){
                          //result.headers = headers;  
                        //}
                        return result;
                    });
                    applyLanguageHeader(RestangularConfigurer);
                }),

               /** Endpoint for CECenter Search API. */
                CECenterProductSearch: Restangular.withConfig(function(RestangularConfigurer) {
                    //set the base url
                        RestangularConfigurer.setBaseUrl(siteConfig.apis.cecenterSearchProduct.baseUrl);
                        //add request intereceptor
                   /*
                         RestangularConfigurer.addFullRequestInterceptor(function (element, operation, route, url, headers, params, httpConfig) {
                            return {
                                element: element,
                                params: params,
                                headers: _.extend(headers, { 'hybris-tenant': 'selfservice1605'}),
                                httpConfig: httpConfig
                            };
                        });
                    */
                        RestangularConfigurer.setResponseInterceptor(function (data, operation, what, url, response) {
                            var headers = response.headers();
                            var result = response.data;
                            if (result){
                              result.headers = headers;
                            }
                            return result;
                        });
                        applyLanguageHeader(RestangularConfigurer);

                    })
            };


    }]);