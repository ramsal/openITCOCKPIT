angular.module('openITCOCKPIT').directive('repeatDone', function(){
    return {
        restrict: "A",
        link: function(scope, element, attrs){
            if(scope.$last){
                setTimeout(function(){
                    scope.$eval(attrs.repeatDone);
                }, 200);
            }
        }
    };
});