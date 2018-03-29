angular.module('openITCOCKPIT').directive('dashboardWidgetTrafficLightDirective', function($http){
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
                $http.get('/dashboards/widget_traffic_light.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.traffic_light;
                });
            };

            angular.element(function(){
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
                $scope.redBulb.css('backgroundColor', 'black');
                $scope.yellowBulb.css('backgroundColor', 'black');
                $scope.greenBulb.css('backgroundColor', 'black');
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
