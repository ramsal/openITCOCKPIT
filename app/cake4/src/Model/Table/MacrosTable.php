<?php

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Utility\Hash;
use Cake\Validation\Validator;

/**
 * Macros Model
 *
 * @method \App\Model\Entity\Macro get($primaryKey, $options = [])
 * @method \App\Model\Entity\Macro newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Macro[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Macro|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Macro|bool saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Macro patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Macro[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Macro findOrCreate($search, callable $callback = null, $options = [])
 *
 * @mixin \Cake\ORM\Behavior\TimestampBehavior
 */
class MacrosTable extends Table {

    /**
     * Nagios supports up to 256 $USERx$ macros ($USER1$ through $USER256$)
     * @var int
     */
    private $maximum = 256;

    /**
     * Initialize method
     *
     * @param array $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config) {
        parent::initialize($config);

        $this->setTable('macros');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator) {
        $validator
            ->integer('id')
            ->allowEmptyString('id', 'create');

        $validator
            ->scalar('name')
            ->maxLength('name', 10)
            ->requirePresence('name', 'create')
            ->allowEmptyString('name', false);

        $validator
            ->scalar('value')
            ->maxLength('value', 255)
            ->requirePresence('value', 'create')
            ->allowEmptyString('value', false);

        $validator
            ->scalar('description')
            ->maxLength('description', 255)
            ->requirePresence('description', 'create')
            ->allowEmptyString('description', true);

        $validator
            ->integer('password')
            ->requirePresence('password', 'create')
            ->allowEmptyString('password', false);

        return $validator;
    }

    public function buildRules(RulesChecker $rules) {
        $rules->add($rules->isUnique(['name']));
        return $rules;
    }

    /**
     * @return array
     */
    public function getAllMacrosInCake2Format() {
        $macros = $this->find('all')->disableHydration();
        $all_macros = [];
        foreach ($macros as $macro) {
            $all_macros[] = [
                'Macro' => $macro
            ];
        }
        return $all_macros;
    }

    /**
     * @return array
     */
    public function getAvailableMacroNames() {
        $macros = $this->find('all', [
            'fields' => [
                'Macros.name'
            ]
        ])->disableHydration()->toArray();

        $usedMacoNames = Hash::extract($macros, '{n}.name');
        $usedMacoNames = array_combine($usedMacoNames, $usedMacoNames);

        $availableMacroNames = [];
        for ($i = 1; $i <= $this->maximum; $i++) {
            $macroName = sprintf('$USER%s$', $i);
            if (!isset($usedMacoNames[$macroName])) {
                $availableMacroNames[$macroName] = $macroName;
            }
        }
        return $availableMacroNames;
    }
}
