<header dashboard-widget-header-directive=""
        class="ui-draggable-handle pointer"
        wtitle="title"
        wid="id"
        update-title="updateTitle({id:id,title:title})">
</header>

<div class="content" style="">

    <!-- widget edit box -->
    <div class="jarviswidget-editbox not-draggable" style="display: none;">
        <!-- This area used as dropdown edit box -->
        <input class="form-control" type="text" placeholder="Widget title" ng-model="title"
               ng-model-options="{debounce: 1000}">
        <span class="note"><i class="fa fa-check text-success"></i>
            <?php echo __('Change title to update and save instantly'); ?>
        </span>
    </div>

    <div class="widget-body padding-0 not-draggable">

        <div class="padding-10" style="border: 1px solid #c3c3c3;">
            <div class="row">
                <div class="col-xs-2">
                    <a href="javascript:void(0);" ng-show="paging_autostart" ng-click="pausePaging()"
                       data-widget-id="21" title="<?php echo __('disable paging'); ?>"
                       class="btn btn-default btn-xs stopRotation btn-primary"><i class="fa fa-pause"></i></a>
                    <a href="javascript:void(0);" ng-show="!paging_autostart"
                       ng-click="startPaging()" data-widget-id="21" title="<?php echo __('enable paging'); ?>"
                       class="btn btn-default btn-xs startRotation btn-primary"><i class="fa fa-play"></i></a>
                </div>
                <div class="col-xs-4 height-45px">
                    <div class="form-group form-group-slider">

                        <label class="display-inline">
                            <?php echo __('Paging interval:'); ?>
                            <span class="note" id="PagingInterval_human">
                                {{pagingTimeString}}
                            </span>
                        </label>

                        <div class="slidecontainer">
                            <input type="range" step="5" min="0" max="300" class="slider"
                                   ng-model="viewPagingInterval" ng-mouseup="savePagingInterval()">
                        </div>

                    </div>
                </div>
                <div class="col-xs-6 ">
                    <div class="form-group smart-form">
                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Servicestatus.current_state.ok"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-success"></i>
                            <?php echo __('Ok'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Servicestatus.current_state.warning"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-warning"></i>
                            <?php echo __('Warning'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Servicestatus.current_state.critical"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-danger"></i>
                            <?php echo __('Critical'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Servicestatus.current_state.unknown"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-default"></i>
                            <?php echo __('Unknown'); ?>
                        </label>
                    </div>
                    <div class="form-group smart-form">

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Servicestatus.acknowledged"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-primary"></i>
                            <?php echo __('Acknowledged'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Servicestatus.downtime"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-primary"></i>
                            <?php echo __('In Downtime'); ?>
                        </label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12 col-md-6">
                    <div class="form-group smart-form">
                        <label class="input"> <i class="icon-prepend fa fa-filter"></i>
                            <input type="text" class="input-sm"
                                   placeholder="<?php echo __('Filter by service name'); ?>"
                                   ng-model="statusListSettings.filter.Service.name"
                                   ng-model-options="{debounce: 500}">
                        </label>
                    </div>
                </div>
                <div class="col-xs-12 col-md-6">
                    <div class="form-group smart-form">
                        <label class="input"> <i class="icon-prepend fa fa-filter"></i>
                            <input type="text" class="input-sm"
                                   placeholder="<?php echo __('Filter by host name'); ?>"
                                   ng-model="statusListSettings.filter.Host.name"
                                   ng-model-options="{debounce: 500}">
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div id="mobile_table{{id}}" class="mobile_table margin-top-10">
            <table id="service_list"
                   class="table table-striped table-hover table-bordered smart-form"
                   style="">
                <thead>
                <tr>
                    <th class="no-sort" ng-click="orderBy('Servicestatus.current_state')">
                        <i class="fa" ng-class="getSortClass('Servicestatus.current_state')"></i>
                        <?php echo __('State'); ?>
                    </th>
                    <th class="no-sort text-center">
                        <i class="fa fa-user fa-lg" title="<?php echo __('is acknowledged'); ?>"></i>
                    </th>

                    <th class="no-sort text-center">
                        <i class="fa fa-power-off fa-lg"
                           title="<?php echo __('is in downtime'); ?>"></i>
                    </th>
                    <th class="no-sort" ng-click="orderBy('Host.name')">
                        <i class="fa" ng-class="getSortClass('Host.name')"></i>
                        <?php echo __('Host name'); ?>
                    </th>
                    <th class="no-sort" ng-click="orderBy('Service.name')">
                        <i class="fa" ng-class="getSortClass('Service.name')"></i>
                        <?php echo __('Service name'); ?>
                    </th>
                    <th class="no-sort" ng-click="orderBy('Servicestatus.last_state_change')">
                        <i class="fa" ng-class="getSortClass('Servicestatus.last_state_change')"></i>
                        <?php echo __('State since'); ?>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr ng-repeat="service in services">
                    <td class="text-center">
                        <servicestatusicon service="service"></servicestatusicon>
                    </td>
                    <td class="text-center">
                        <i class="fa fa-lg fa-user"
                           ng-show="service.Servicestatus.problemHasBeenAcknowledged"
                           ng-if="service.Servicestatus.acknowledgement_type == 1"></i>

                        <i class="fa fa-lg fa-user-o"
                           ng-show="service.Servicestatus.problemHasBeenAcknowledged"
                           ng-if="service.Servicestatus.acknowledgement_type == 2"
                           title="<?php echo __('Sticky Acknowledgedment'); ?>"></i>
                    </td>

                    <td class="text-center">
                        <i class="fa fa-lg fa-power-off"
                           ng-show="service.Servicestatus.scheduledDowntimeDepth > 0"></i>
                    </td>
                    <td>
                        <?php if ($this->Acl->hasPermission('browser')): ?>
                            <a href="/hosts/browser/{{ service.Host.id }}">
                                {{ service.Host.hostname }}
                            </a>
                        <?php else: ?>
                            {{ service.Host.hostname }}
                        <?php endif; ?>
                    </td>
                    <td>
                        <?php if ($this->Acl->hasPermission('browser')): ?>
                            <a href="/services/browser/{{ service.Service.id }}">
                                {{ service.Service.servicename }}
                            </a>
                        <?php else: ?>
                            {{ service.Service.servicename }}
                        <?php endif; ?>
                    </td>
                    <td>
                        {{ service.Servicestatus.last_state_change }}
                    </td>
                </tr>
                </tbody>
            </table>

        </div>

        <div class="dt-toolbar-footer" style="margin-top: -9px">
            <div class="col-xs-12 col-sm-4">
                <div class="dataTables_info" id="DataTables_Table_0_info" role="status" aria-live="polite">
                    Showing <span class="txt-color-darken">{{ paging.widget.from }}</span>
                    to <span class="txt-color-darken">{{ paging.widget.to }}</span>
                    of <span class="text-primary">{{ paging.count }}</span> entries
                </div>
            </div>
            <div class="col-xs-12 col-sm-8">
                <div class="dataTables_paginate paging_numbers" id="DataTables_Table_0_paginate">
                    <ul class="pagination pagination-sm">
                        <li class="paginate_button cursor-pointer" aria-controls="DataTables_Table_0" tabindex="0"
                            ng-repeat="i in [].constructor(paging.pageCount) track by $index"
                            ng-class="$index+1==paging.page ? 'active' : ''">
                            <a ng-click="setPage( $index+1 )">{{ $index+1 }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </div>
</div>