angular.module('openITCOCKPIT').directive('confirmTabDelete', function($http, $filter, $timeout){
    return {
        restrict: 'E',
        templateUrl: '/angular/confirm_delete.html',

        controller: function($scope){

            let object;

            $scope.setObject = function(_object){
                object = _object;
            };

            $scope.delete = function(){
                $scope.isDeleting = true;
                $http.post($scope.deleteUrl).then(
                    function(result){

                        let elem = document.getElementById('tab-' + $scope.tab.id);
                        elem.parentNode.removeChild(elem);
                        let arr = [];
                        for(let i in $scope.tabs){
                            let tabId = $scope.tabs[i].DashboardTab.id;
                            if(tabId != $scope.tab.id){
                                arr.push($scope.tabs[i]);
                            }
                        }
                        $scope.tabs = arr;
                        $scope.createTabSort();
                        $scope.tabOrder = $scope.sortable.toArray();
                        $scope.generateSortIdsFromTabs();

                        $('#angularConfirmDelete').modal('hide');
                        $scope.errors = null;
                        $scope.tab.id = null;
                        $scope.load();
                    }, function errorCallback(result){
                        console.error(result.data);
                        $scope.errors = result.data;
                    }
                );
                $scope.isDeleting = false;
            };

        },

        link: function($scope, element, attr){
            $scope.confirmTabDelete = function(object){
                $scope.setObject(object);
                $('#angularConfirmDelete').modal('show');
            };
        }
    };
});