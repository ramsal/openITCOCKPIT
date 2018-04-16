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
        <hr>
        <textarea name="notes" class="form-control notice-text" maxlength="4000" cols="30" rows="4"
                  ng-model-options="{debounce: 500}" ng-model="widget.WidgetNotice.note">
        </textarea>
        <span class="note"><i class="fa fa-code text-primary"></i>
            <?php echo __('Insert text, html or markdown code'); ?>
        </span>
    </div>


    <div class="widget-body padding-0 not-draggable">
        <div style="padding:13px;" id="notice-{{id}}"></div>
    </div>
</div>
