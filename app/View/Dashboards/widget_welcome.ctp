<?php echo $this->element('Dashboard/widget_header'); ?>
<div class="content" style="">

    <!-- widget edit box -->
    <div class="jarviswidget-editbox not-draggable" style="display: none;">
        <!-- This area used as dropdown edit box -->
        <input class="form-control" type="text" placeholder="Widget title" ng-model="title" ng-model-options="{debounce: 1000}">
        <span class="note"><i class="fa fa-check text-success"></i> Change title to update and save instantly</span>

    </div>

    <div class="widget-body padding-0 not-draggable">
        <div style="padding:13px;">
            <div class="pull-left">
                <img src="/img/fallback_user.png?v3.3.0" width="120" height="auto"
                     id="userImage" style="border-left: 3px solid #40AC2B;" alt=""/>
            </div>
            <div class="pull-left col-md-7">
                <strong>{{widget.hosts}}</strong> hosts are monitored <br/>
                <strong>{{widget.services}}</strong> services are monitored <br/>
                <br/>
                Your selected Timezone is <strong>{{widget.timezone}}</strong>
                ({{widget.date}})
            </div>
        </div>
    </div>
</div>
<script src="/smartadmin/js/smartwidgets/jarvis.widget.js"></script>