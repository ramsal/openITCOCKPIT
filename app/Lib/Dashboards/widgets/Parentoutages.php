<?php
// Copyright (C) <2015>  <it-novum GmbH>
//
// This file is dual licensed
//
// 1.
//	This program is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, version 3 of the License.
//
//	This program is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

// 2.
//	If you purchased an openITCOCKPIT Enterprise Edition you can use this file
//	under the terms of the openITCOCKPIT Enterprise Edition license agreement.
//	License agreement and license key will be shipped with the order
//	confirmation.

namespace Dashboard\Widget;
class Parentoutages extends Widget {
    public $isDefault = true;
    public $icon = 'fa-exchange';
    public $element = 'parent_outages';
    public $width = 5;
    public $height = 10;
    public $directive = "dashboard-widget-parent-outages-directive";

    public function __construct (\Controller $controller, $QueryCache) {
        parent::__construct($controller, $QueryCache);
        $this->typeId = 2;
        $this->title = __('Parent outages');
    }

    public function setData ($widgetData) {
        //Prefix every widget variable with $widgetFoo
        $widgetParentOutages = $this->QueryCache->parentOutages();
        $this->Controller->set(compact(['widgetParentOutages']));
    }

    public function getRestoreConfig ($tabId) {
        $restoreConfig = [
            'dashboard_tab_id' => $tabId,
            'type_id'          => $this->typeId,
            'row'              => 0,
            'col'              => 5,
            'width'            => $this->width,
            'height'           => $this->height,
            'title'            => $this->title,
            'color'            => $this->defaultColor,
            'directive'        => $this->directive
        ];

        return $restoreConfig;
    }

}
