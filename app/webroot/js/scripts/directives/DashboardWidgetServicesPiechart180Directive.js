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

            $scope.load = function(){
                $http.get('/dashboards/widget_services_piechart.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.services_piechart;
                    let x = [4, 1, 3, 1];
                    let xsum = 0;
                    x.forEach(function(num){
                        xsum = (xsum + num);
                    });
                    $scope.widget = {
                        'ok': [x[0], Math.round((x[0] / xsum) * 100)],
                        'warning': [x[1], Math.round((x[1] / xsum) * 100)],
                        'critical': [x[2], Math.round((x[2] / xsum) * 100)],
                        'unknown': [x[3], Math.round((x[3] / xsum) * 100)]
                    };


                    angular.element(function(){        //page loading completed
                        if(document.getElementById("myChart" + $scope.id)){
                            $scope.ctx = document.getElementById("myChart" + $scope.id);
                            console.log($scope.widget);
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

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

        }
    };
});
