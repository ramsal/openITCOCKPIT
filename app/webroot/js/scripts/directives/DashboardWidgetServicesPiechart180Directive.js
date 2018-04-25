angular.module('openITCOCKPIT').directive('dashboardWidgetServicesPiechart180Directive', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_services_piechart.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = null;
            $scope.showpng = true;
            $scope.isHalf = 1;

            $scope.load = function(){
                $http.get('/dashboards/getPiechartSettings.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.showpng = result.data.settings.use_png;
                });

                $http.get('/angular/serviceStats.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    let servicestatusCount = result.data.servicestatusCount;
                    let states = [servicestatusCount[0], servicestatusCount[1], servicestatusCount[2], servicestatusCount[3]];
                    let total = servicestatusCount.total;

                    $scope.widget = {
                        'ok': [states[0], Math.round((states[0] / total) * 100)],
                        'warning': [states[1], Math.round((states[1] / total) * 100)],
                        'critical': [states[2], Math.round((states[2] / total) * 100)],
                        'unknown': [states[3], Math.round((states[3] / total) * 100)]
                    };

                    angular.element(function(){        //page loading completed
                        if(document.getElementById("myChart" + $scope.id)){
                            $scope.ctx = document.getElementById("myChart" + $scope.id);
                            $scope.myPieChart = new Chart($scope.ctx, {
                                type: 'pie',
                                data: {
                                    labels: ["Ok", "Warning", "Critical", "Unknown"],
                                    datasets: [{
                                        data: [
                                            $scope.widget.ok[0],
                                            $scope.widget.warning[0],
                                            $scope.widget.critical[0],
                                            $scope.widget.unknown[0]
                                        ],
                                        backgroundColor: [
                                            'rgba(68, 157, 68, 1)',
                                            'rgba(223, 143, 29, 1)',
                                            'rgba(201, 48, 44, 1)',
                                            'rgba(146, 162, 168, 1)'
                                        ],
                                        borderWidth: 0
                                    }]
                                },
                                options: {
                                    rotation: Math.PI,
                                    circumference: Math.PI,
                                    legend: {
                                        display: true,
                                        labels: {
                                            usePointStyle: true,
                                            generateLabels: {
                                                hidden: true
                                            }

                                        }
                                    }
                                }
                            });
                        }
                    });

                });
            };

            $scope.saveSettings = function(){
                let data = {
                    widgetId: $scope.id,
                    use_png: $scope.showpng ? "1" : "0"
                };
                $http.post('/dashboards/savePiechartSettings.json?angular=true', data);
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

        }
    };
});
