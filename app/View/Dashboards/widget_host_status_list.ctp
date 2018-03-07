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
                    <a href="javascript:void(0);" ng-show="pagingOn" ng-click="pausePaging()" data-widget-id="21"
                       class="btn btn-default btn-xs stopRotation btn-primary"><i class="fa fa-pause"></i></a>
                    <a href="javascript:void(0);" ng-show="!pagingOn" ng-click="startPaging()" data-widget-id="21"
                       class="btn btn-default btn-xs startRotation btn-primary"><i class="fa fa-play"></i></a>
                    <a href="javascript:void(0);" ng-click="setAnimation('fadeInRight')" class="btn btn-default btn-xs"
                       data-widget-id="21"><i class="fa fa-arrow-left"></i></a>
                    <a href="javascript:void(0);" ng-click="setAnimation('fadeInUp')" class="btn btn-default btn-xs"
                       data-widget-id="21"><i class="fa fa-arrow-up"></i></a>
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
                                   ng-model="statusListSettings.filter.Hoststatus.current_state.up"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-success"></i>
                            <?php echo __('Up'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Hoststatus.current_state.down"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-danger"></i>
                            <?php echo __('Down'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Hoststatus.current_state.unreachable"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-default"></i>
                            <?php echo __('Unreachable'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Hoststatus.acknowledged"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-primary"></i>
                            <?php echo __('Acknowledged'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="statusListSettings.filter.Hoststatus.downtime"
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
                                   placeholder="<?php echo __('Filter by host name'); ?>"
                                   ng-model="statusListSettings.filter.Host.name"
                                   ng-model-options="{debounce: 500}">
                        </label>
                    </div>
                </div>
                <?php /*<div class="col-xs-12 col-md-6">
                    <div class="form-group smart-form">
                        <label class="input"> <i class="icon-prepend fa fa-filter"></i>
                            <input type="text" class="input-sm"
                                   placeholder="<?php echo __('Filter by output'); ?>"
                                   ng-model="filter.Hoststatus.output"
                                   ng-model-options="{debounce: 500}">
                        </label>
                    </div>
                </div>*/ ?>
            </div>
        </div>

        <div id="mobile_table{{id}}" class="mobile_table margin-top-10" style="overflow: auto; height: 200px;">
            <table id="host_list"
                   class="table table-striped table-hover table-bordered smart-form"
                   style="">
                <thead>
                <tr>
                    <th colspan="2" class="no-sort" ng-click="orderBy('Hoststatus.current_state')">
                        <i class="fa" ng-class="getSortClass('Hoststatus.current_state')"></i>
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
                    <th class="no-sort" ng-click="orderBy('Hoststatus.last_state_change')">
                        <i class="fa" ng-class="getSortClass('Hoststatus.last_state_change')"></i>
                        <?php echo __('State since'); ?>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr ng-repeat="host in hosts">
                    <td class="text-center">
                        <hoststatusicon host="host"></hoststatusicon>
                    </td>
                    <td class="text-center">
                        <i class="fa fa-lg fa-user"
                           ng-show="host.Hoststatus.problemHasBeenAcknowledged"
                           ng-if="host.Hoststatus.acknowledgement_type == 1"></i>

                        <i class="fa fa-lg fa-user-o"
                           ng-show="host.Hoststatus.problemHasBeenAcknowledged"
                           ng-if="host.Hoststatus.acknowledgement_type == 2"
                           title="<?php echo __('Sticky Acknowledgedment'); ?>"></i>
                    </td>

                    <td class="text-center">
                        <i class="fa fa-lg fa-power-off"
                           ng-show="host.Hoststatus.scheduledDowntimeDepth > 0"></i>
                    </td>
                    <td>
                        <?php if ($this->Acl->hasPermission('browser')): ?>
                            <a href="/hosts/browser/{{ host.Host.id }}">
                                {{ host.Host.hostname }}
                            </a>
                        <?php else: ?>
                            {{ host.Host.hostname }}
                        <?php endif; ?>
                    </td>
                    <td>
                        {{ host.Hoststatus.last_state_change }}
                    </td>
                </tr>
                </tbody>
            </table>

        </div>

        <div class="dt-toolbar-footer">
            <div class="col-xs-12 col-sm-6">
                <div class="dataTables_info" id="DataTables_Table_0_info" role="status" aria-live="polite">Showing <span
                            class="txt-color-darken">1</span> to <span class="txt-color-darken">2</span> of <span
                            class="text-primary">2</span> entries
                </div>
            </div>
            <div class="col-xs-12 col-sm-6">
                <div class="dataTables_paginate paging_numbers" id="DataTables_Table_0_paginate">
                    <ul class="pagination pagination-sm">
                        <li class="paginate_button active" aria-controls="DataTables_Table_0" tabindex="0"><a
                                    href="#">1</a></li>
                    </ul>
                </div>
            </div>
        </div>

    </div>

</div>