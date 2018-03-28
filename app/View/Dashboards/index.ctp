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
?>
<div class="row">
    <div class="col-xs-12 col-sm-7 col-md-7 col-lg-4">
        <h1 class="page-title txt-color-blueDark">
            <i class="fa fa-dashboard fa-fw "></i>
            <?php echo __('Dashboard') ?>
        </h1>
    </div>
</div>

<confirm-tab-delete></confirm-tab-delete>

<section id="widget-grid" class="">
    <div class="row">
        <article class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div class="jarviswidget" id="wid-id-1" data-widget-editbutton="false">
                <header>
                    <div class="tabsContainer">
                        <ul class="nav nav-tabs pull-left">

                            <li class="active dropdown-toggle" ng-repeat-start="_tab in tabs"
                                data-tab-id="{{ _tab.DashboardTab.id }}"
                                ng-if="tab.id == _tab.DashboardTab.id">
                                <a class="pointer" data-toggle="dropdown" href="javascript:void(0);">
                                    <span ng-class="_tab.DashboardTab.shared ? 'text-primary' : ''" class="text">{{ _tab.DashboardTab.name }}</span>
                                    <b class="caret"></b>
                                </a>
                                <ul class="dropdown-menu">
                                    <li>
                                        <a class="pointer tab-select-menu-fix"
                                           ng-click="openEditModal(); tab.name = _tab.DashboardTab.name; tab.renameId = tab.id">
                                            <i class="fa fa-pencil-square-o"></i>
                                            <?php echo __('Rename'); ?>
                                        </a>
                                    </li>
                                    <li ng-if="!_tab.DashboardTab.shared">
                                        <a class="pointer tab-select-menu-fix"
                                           ng-click="startSharing()">
                                            <i class="fa fa-code-fork"></i>
                                            <?php echo __('Start sharing'); ?>
                                        </a>
                                    </li>
                                    <li ng-if="_tab.DashboardTab.shared">
                                        <a class="pointer tab-select-menu-fix"
                                           ng-click="stopSharing()">
                                            <i class="fa fa-code-fork"></i>
                                            <?php echo __('Stop sharing'); ?>
                                        </a>
                                    </li>
                                    <li class="divider"></li>
                                    <li>
                                        <a class="pointer txt-color-red"
                                           ng-click="deleteTab(); tab.name = _tab.DashboardTab.name">
                                            <i class="fa fa-trash-o"></i>
                                            <?php echo __('Delete'); ?>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li ng-repeat-end
                                data-tab-id="{{ _tab.DashboardTab.id }}"
                                ng-if="tab.id != _tab.DashboardTab.id">
                                <a class="pointer"
                                   ng-click="tab.id = _tab.DashboardTab.id; tab.name = _tab.DashboardTab.name">
                                    <span ng-class="_tab.DashboardTab.shared ? 'text-primary' : ''" class="text">{{ _tab.DashboardTab.name }}</span>
                                </a>
                            </li>

                        </ul>
                    </div>

                    <div class="widget-toolbar" role="menu">
                        <div class="btn-group">
                            <button data-toggle="dropdown" class="btn dropdown-toggle btn-xs btn-success">
                                <?php echo __('Add Widget') ?> <i class="fa fa-caret-down"></i>
                            </button>
                            <ul class="dropdown-menu pull-right">
                                <li ng-repeat="widget in allWidgets">
                                    <a href="javascript:void(0);" class="addWidget"
                                       data-type-id="{{ widget.typeId }}">
                                        <i class="fa {{ widget.icon }}"></i>&nbsp;
                                        {{ widget.title }}
                                    </a>
                                </li>
                                <li class="divider"></li>
                                <li>
                                    <a href="/dashboards/restoreDefault/{{ tab.id }}">
                                        <i class="fa fa-recycle"></i>&nbsp;
                                        <?php echo __('Restore default'); ?>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="widget-toolbar" rile="menu">
                        <button class="btn btn-xs btn-primary" data-toggle="modal" data-target="#tabRotateModal">
                            <i class="fa fa-refresh" id="tabRotationIcon"></i>
                        </button>
                    </div>
                    <div class="widget-toolbar" rile="menu">
                        <button class="btn btn-xs btn-success" data-toggle="modal" ng-click='openNewTabModal()'>
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>

                </header>
                <div>

                    <div class="widget-body no-padding padding-top-10">
                        <div class="padding-bottom-10">

                            <div class="grid-stack" id="grid-stack" data-gs-width="0">

                                <div ng-repeat="widget in preparedWidgets"
                                     data-gs-height="{{widget.Widget.height}}"
                                     data-gs-width="{{widget.Widget.width}}"
                                     data-gs-x="{{widget.Widget.col}}"
                                     data-gs-y="{{widget.Widget.row}}"
                                     data-widget-id="{{widget.Widget.id}}"
                                     data-widget-type-id="{{widget.Widget.type_id}}"
                                     class="grid-stack-item ui-draggable ui-resizable"
                                     id="{{widget.Widget.id}}">

                                    <div class="grid-stack-item-content">
                                        <div id="widget-color-{{widget.Widget.id}}"
                                             class="jarviswidget {{widget.Widget.color}}"
                                             data-widget-attstyle="{{widget.Widget.color}}"
                                             role="widget"
                                             attrs="widget.Widget.directive"
                                             wtitle="widget.Widget.title"
                                             wid="widget.Widget.id"
                                             update-title="updateWidgetTitle(id,title)">
                                        </div>
                                    </div>
                                    <div ng-if="$last" ng-init="$last?loadGrid():null"></div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    </div>
</section>


<div class="modal fade" id="addTabModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                    &times;
                </button>
                <h4 class="modal-title" id="myModalLabel"><?php echo __('Create new Tab'); ?></h4>
            </div>
            <div class="modal-body">
                <div ng-class="{'has-error': errors.name}">
                    <input type="text"
                           class="form-control"
                           maxlength="255"
                           required="required"
                           placeholder="<?php echo __('Tab name'); ?>"
                           ng-model="tab.newname"
                    >
                    <div ng-repeat="error in errors.name">
                        <div class="help-block text-danger">{{ error }}</div>
                    </div>
                    <div style="height:35px;">
                        <button type="submit" class="btn btn-primary pull-right margin-top-10" ng-click="newTab()">
                            <?php echo __('Save'); ?>
                        </button>
                    </div>
                </div>
                <div ng-class="{'has-error': errors.source_tab}">
                    <hr/>
                    <h3><?php echo __('Create from shared tab'); ?></h3>
                    <select
                            id="sharedTabSelect"
                            data-placeholder="<?php echo __('Shared tabs'); ?>"
                            class="form-control chosen"
                            chosen="sharedTabs"
                            ng-options="key as value for (key, value) in sharedTabs"
                            ng-model="tab.selectedSharedTab"
                    >
                    </select>
                    <div ng-repeat="error in errors.source_tab">
                        <div class="help-block text-danger">{{ error }}</div>
                    </div>
                    <div style="height:35px;">
                        <button type="submit" class="btn btn-primary pull-right margin-top-10"
                                ng-click="newSharedTab()">
                            <?php echo __('Save'); ?>
                        </button>
                    </div>
                    <br/>
                    <br/>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">
                    <?php echo __('Close'); ?>
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="editTabModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form onsubmit="return false;">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                        &times;
                    </button>
                    <h4 class="modal-title" id="myModalLabel"><?php echo __('Edit tab'); ?></h4>
                </div>
                <div class="modal-body" ng-class="{'has-error': errors.name}">
                    <div>
                        <input type="text"
                               class="form-control"
                               maxlength="255"
                               required="required"
                               placeholder="<?php echo __('Tab name'); ?>"
                               ng-model="tab.name"
                        >
                        <div ng-repeat="error in errors.name">
                            <div class="help-block text-danger">{{ error }}</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="pull-left" ng-repeat="error in errors.id">
                        <div class="help-block text-danger">{{ error }}</div>
                    </div>
                    <button type="submit" class="btn btn-primary" ng-click="renameTab()">
                        <?php echo __('Save'); ?>
                    </button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">
                        <?php echo __('Cancel'); ?>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="updateAvailableModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
     aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                    &times;
                </button>
                <h4 class="modal-title" id="myModalLabel"><?php echo __('For your tab is an update available'); ?></h4>
            </div>
            <div class="modal-body">
                <h3><?php echo __('Do you want to perform a update?'); ?></h3>
                <?php
                echo $this->Form->create('dashboard', [
                    'class' => 'form-horizontal clear',
                    'url'   => 'updateSharedTab',
                ]);
                echo $this->Form->input('ask_again', [
                    'type'    => 'checkbox',
                    'checked' => false,
                    'label'   => __('Don\'t ask again for this tab'),
                ]);
                echo $this->Form->input('tabId', [
                    'type'  => 'hidden',
                    'value' => $tab['DashboardTab']['id'],
                ]);
                ?>
            </div>
            <div class="modal-footer">
                <div style="height:35px;">
                    <?php
                    echo $this->Form->submit(__('Yes'), [
                        'class' => [
                            'btn btn-primary',
                        ],
                        'div'   => false,
                        'value' => 1,
                    ]); ?>
                    <button class="btn btn-default" data-dismiss="modal" id="noAutoUpdate">
                        <?php echo __('No'); ?>
                    </button>
                </div>
                <?php echo $this->Form->end(); ?>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="tabRotateModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
     aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                    &times;
                </button>
                <h4 class="modal-title" id="myModalLabel"><?php echo __('Setup a tab rotation interval'); ?></h4>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col col-xs-12">
                        <div class="form-group form-group-slider ">
                            <label class="col"
                                   for="tabRotationInterval"><?php echo __('Choose tab rotation interval'); ?></label>
                            <div class="col">

                                <div class="slidecontainer">
                                    <input type="range" step="10" min="0" max="900" class="slider"
                                           ng-model="viewTabRotateInterval" ng-mouseup="saveTabRotateInterval()">
                                </div>

                            </div>
                            <div class="col">
                                <span class="note" id="TabRotationInterval_human">
                                    {{tabRotateTimeString}}
                                </span>
                            </div>
                        </div>
                        <div ng-show="showRotationSavesMessage" class="alert alert-success margin-top-10">
                            <?php echo __('Rotation interval successfully saved!'); ?>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div style="height:35px;">
                    <button class="btn btn-default" data-dismiss="modal">
                        <?php echo __('Close'); ?>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
