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
        <div style="padding:13px;">
            <div class="pull-left">
                <!--<img src="/img/fallback_user.png?v3.3.0" width="120" height="auto"
                     id="userImage" style="border-left: 3px solid #40AC2B;" alt=""/>-->
                <?php
                if ($this->Auth->user('image') != null && $this->Auth->user('image') != ''):
                    if (file_exists(WWW_ROOT . 'userimages' . DS . $this->Auth->user('image'))):
                        echo $this->html->image('/userimages' . DS . $this->Auth->user('image'), ['width' => 120, 'height' => 'auto', 'id' => 'userImage', 'style' => 'border-left: 3px solid #40AC2B;']);
                    else:
                        echo $this->html->image('fallback_user.png', ['width' => 120, 'height' => 'auto', 'id' => 'userImage', 'style' => 'border-left: 3px solid #40AC2B;']);
                    endif;
                else:
                    echo $this->html->image('fallback_user.png', ['width' => 120, 'height' => 'auto', 'id' => 'userImage', 'style' => 'border-left: 3px solid #40AC2B;']);
                endif;
                ?>
            </div>
            <div class="pull-left col-md-7">
                <strong>{{widget.hosts}}</strong> <?php echo __('hosts are monitored'); ?><br/>
                <strong>{{widget.services}}</strong> <?php echo __('services are monitored'); ?><br/>
                <br/>
                <?php echo __('Your selected Timezone is'); ?> <strong>{{widget.timezone}}</strong>
                ({{widget.date}})
            </div>
        </div>
    </div>
</div>
