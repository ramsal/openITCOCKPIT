angular.module('openITCOCKPIT').directive('attrs', function attributesDirective($compile, $parse) {
    'use strict';

    return {
        priority: 999,
        terminal: true,
        restrict: 'A',
        compile: function attributesCompile() {
            return function attributesLink($scope, element, attrs) {
                function parseAttr(key, value) {
                    function convertToDashes(match) {
                        return match[0] + '-' + match[1].toLowerCase();
                    }

                    attrs.$set(key.replace(/([a-z][A-Z])/g, convertToDashes), value !== undefined && value !== null ? value : '');
                }

                var passedAttributes = $parse(attrs.attrs)($scope);

                if (passedAttributes !== null && passedAttributes !== undefined) {
                    if (typeof passedAttributes === 'object') {
                        for (var subkey in passedAttributes) {
                            parseAttr(subkey, passedAttributes[subkey]);
                        }
                    } else if (typeof passedAttributes === 'string') {
                        parseAttr(passedAttributes, null);
                    }
                }

                $compile(element, null, 999)($scope);
            };
        }
    };
});