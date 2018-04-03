angular.module('openITCOCKPIT').directive('dashboardWidgetTrafficLightDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_traffic_light.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = {};

            $scope.load = function(){
                $http.post('/dashboards/widget_traffic_light.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.widget = result.data.traffic_light;
                });
            };

            $scope.fetchServiceState = function(){
                $http.post('/dashboards/widget_traffic_light.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id,
                        'serviceId': $scope.widget.serviceId
                    }
                }).then(function(result){
                    $scope.widget = result.data.traffic_light;

                    let nextcheckdate = new Date($scope.widget.next_check * 1000);
                    let msleft = (Date.now() - nextcheckdate);

                    if($scope.valueTimer){
                        $interval.cancel($scope.valueTimer);
                    }
                    $scope.valueTimer = $interval($scope.fetchServiceState, parseInt(Math.abs(msleft) + 15000));    //add 15 seconds to regulate nagios delay
                });
            };

            $scope.loadServices = function(searchString){
                $http.get("/services/loadServicesByString.json", {
                    params: {
                        'angular': true,
                        'filter[Service.servicename]': searchString,
                        'selected[]': $scope.widget.serviceId
                    }
                }).then(function(result){

                    $scope.services = [];
                    result.data.services.forEach(function(obj, index){
                        $scope.services[index] = {
                            "id": obj.value.Service.id,
                            "group": obj.value.Host.name,
                            "label": obj.value.Host.name + "/" + obj.value.Servicetemplate.name
                        };
                    });

                    $scope.errors = null;
                }, function errorCallback(result){
                    if(result.data.hasOwnProperty('error')){
                        $scope.errors = result.data.error;
                    }
                });
            };

            angular.element(function(){
                $scope.loadServices("");
                $scope.load();
                $('[data-toggle="tooltip"]').tooltip();
                $scope.tr = $('#traffic-light' + $scope.id);
                $scope.redBulb = $('#redLight' + $scope.id);
                $scope.yellowBulb = $('#yellowLight' + $scope.id);
                $scope.greenBulb = $('#greenLight' + $scope.id);
                $scope.updateTrafficLightSize(false, $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue);
            });


            $scope.illuminateRed = function(){
                $scope.clearLights();
                $scope.redBulb.css('backgroundColor', '#c9302c');
            };

            $scope.illuminateYellow = function(){
                $scope.clearLights();
                $scope.yellowBulb.css('backgroundColor', '#ec971f');
            };

            $scope.illuminateGreen = function(){
                $scope.clearLights();
                $scope.greenBulb.css('backgroundColor', '#449d44');
            };

            $scope.clearLights = function(){
                if($scope.redBulb.hasClass('traffic-light-animated-red')){
                    $scope.redBulb.removeClass('traffic-light-animated-red');
                }
                if($scope.yellowBulb.hasClass('traffic-light-animated-yellow')){
                    $scope.yellowBulb.removeClass('traffic-light-animated-yellow');
                }
                if($scope.greenBulb.hasClass('traffic-light-animated-green')){
                    $scope.greenBulb.removeClass('traffic-light-animated-green');
                }
                $scope.redBulb.css('backgroundColor', 'black');
                $scope.yellowBulb.css('backgroundColor', 'black');
                $scope.greenBulb.css('backgroundColor', 'black');
            };

            $scope.colorFade = function(){
                $scope.redBulb.addClass('traffic-light-animated-red');
                $scope.yellowBulb.addClass('traffic-light-animated-yellow');
                $scope.greenBulb.addClass('traffic-light-animated-green');
            };

            $scope.updateTrafficLightSize = function(item = false, height = false){
                if(height || (item && item.id == $scope.id)){
                    if(!height){
                        height = (item.height);
                    }

                    let f = 1;
                    if(height > 18){
                        f = 1 + (height / 150);
                    }

                    if(height < 15){
                        f = 1 + (height / 150);
                        let p = 0;
                        if(height > 13){
                            p = 5;
                        }
                        if(height < 12){
                            f = 1;
                        }
                        if(height < 11){
                            f = 1 - (height / 110);
                        }
                        if(height < 10){
                            f = 0.85;
                        }
                        if(height < 9){
                            f = 0.73;
                        }
                        $scope.tr.parent().css({
                            'padding': p + 'px',
                            'margin-top': Math.abs(height / 13) + 'px'
                        });

                        $scope.tr.css({
                            'height': (height * 12.3636 * f) + 'px',
                            'width': ((height * 12.3636 * f) / 2.235) + 'px'
                        });

                        f = 1 - (height / 150);
                        if(height < 12){
                            f = 0.8;
                        }
                        if(height < 11){
                            f = 0.7;
                        }
                        if(height < 10){
                            f = 0.6;
                        }
                        if(height < 9){
                            f = 0.45;
                        }
                    }else{
                        $scope.tr.parent().css({
                            'padding': '13px',
                            'margin-top': '0px'
                        });

                        $scope.tr.css({
                            'height': (height * 14.0625 * f) + 'px',
                            'width': ((height * 14.0625 * f) / 2.235) + 'px',
                            'padding': (height * 0.7692 * f) + 'px'
                        });

                    }


                    $scope.redBulb.css({
                        'height': (height * 3.846 * f) + 'px',
                        'width': (height * 3.846 * f) + 'px',
                        'margin-top': (height * 0.3846 * f) + 'px'
                    });

                    $scope.yellowBulb.css({
                        'height': (height * 3.846 * f) + 'px',
                        'width': (height * 3.846 * f) + 'px',
                        'margin-top': (height * 0.3846 * f) + 'px'
                    });

                    $scope.greenBulb.css({
                        'height': (height * 3.846 * f) + 'px',
                        'width': (height * 3.846 * f) + 'px',
                        'margin-top': (height * 0.3846 * f) + 'px'
                    });

                }
            };

            $scope.$watch('widget.current_state', function(){
                if($scope.widget.current_state == 0){ //ok
                    $scope.illuminateGreen();
                }
                if($scope.widget.current_state == 1){ //warning
                    $scope.illuminateYellow();
                }
                if($scope.widget.current_state == 2){ //critical
                    $scope.illuminateRed();
                }
                if($scope.widget.current_state == 3){ //unknown   //fade threw all three colors
                    $scope.colorFade();
                }
            });

            $scope.$watch('widget.serviceId', function(){
                if(parseInt($scope.widget.serviceId) > 0){
                    $scope.fetchServiceState();
                }
            });

            $('.grid-stack').on('change', function(event, items){
                if(Array.isArray(items)){
                    items.forEach(function(item){
                        if(item.id == $scope.id){
                            $scope.updateTrafficLightSize(item);
                        }
                    });
                }
            });

        }

    };
});
