<?php

namespace Statusengine2Module\Model\Entity;

use Cake\ORM\Entity;

/**
 * AcknowledgementService Entity
 *
 * @property int $acknowledgement_id
 * @property int $instance_id
 * @property \Cake\I18n\FrozenTime $entry_time
 * @property int $entry_time_usec
 * @property int $acknowledgement_type
 * @property int $object_id
 * @property int $state
 * @property string $author_name
 * @property string $comment_data
 * @property int $is_sticky
 * @property int $persistent_comment
 * @property int $notify_contacts
 *
 * @property \Statusengine2Module\Model\Entity\ObjectEntity $object
 */
class AcknowledgementService extends Entity {
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        'instance_id'          => true,
        'entry_time'           => true,
        'entry_time_usec'      => true,
        'acknowledgement_type' => true,
        'object_id'            => true,
        'state'                => true,
        'author_name'          => true,
        'comment_data'         => true,
        'is_sticky'            => true,
        'persistent_comment'   => true,
        'notify_contacts'      => true,
        'instance'             => true,
        'object'               => true
    ];
}
