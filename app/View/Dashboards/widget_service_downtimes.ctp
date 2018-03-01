<?php echo $this->element('Dashboard/widget_header'); ?>
<div class="content" style="">

    <!-- widget edit box -->
    <div class="jarviswidget-editbox not-draggable" style="display: none;">
        <!-- This area used as dropdown edit box -->
        <input class="form-control" type="text" placeholder="Widget title" ng-model="title"
               ng-model-options="{debounce: 1000}">
        <span class="note"><i class="fa fa-check text-success"></i> Change title to update and save instantly</span>

    </div>

    <div class="widget-body padding-0 not-draggable">

        <div ng-show="!widget.length" class="text-center text-success">
            <h5 class="padding-top-50">
                <i class="fa fa-check"></i>
                <?php echo __('Currently are no services in scheduled downtime'); ?>
            </h5>
        </div>

        <div ng-show="widget.length" style="overflow:auto;">
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <tbody>
                    <tr ng-repeat="service in widget">
                        <td title="{{service.Service.name}}" class="dashboard-table">
                            <a class="{{service.Servicestatus.current_state == 2 ? 'txt-color-blueDark' : 'text-danger'}}"
                               href="/services/browser/{{service.Service.id}}">
                                {{service.Service.name}}
                            </a>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</div>
