<template>
    <el-form ref="detail-form" :model="detail" label-position="right" label-width="120px" :rules="rules"
        class="input-form">
        <el-row>
            <el-col :key="`col-${field.name}`" v-for="field in metadata.fields"
                :span="24 / (field.type == 'Text' ? 1 : formCols)"
                v-if="!field.hidden && (['IDStr', 'Integer', 'String', 'Enum', 'Dictionary', 'Text', 'Timestamp', 'Decimal', 'ToMany', 'ToOne', 'Date'].includes(field.type) || field.uiType)">
                <el-form-item :name="field.name" :label="field.label" :prop="field.name">
                    <span
                        v-if="mode == 'readonly' || (mode == 'update' && !field.editable) || field.type == 'Timestamp'">{{
                            detail[field.name]
                        }}</span>
                    <component v-else-if="field.uiType" :is="getCustomComponent()[field.uiType]"
                        v-bind="{ field: field, row: detail, params: getCustomComponent()[field.uiType + '_params'] }"
                        v-model="detail[field.name]" />
                    <el-input v-model="detail[field.name]" v-else-if="['Integer', 'Decimal'].includes(field.type)"
                        style="width:100px;"></el-input>
                    <el-input :type="field.type == 'Text' ? 'textarea' : 'text'" v-model="detail[field.name]"
                        v-else-if="['String', 'Text', 'IDStr'].includes(field.type)"></el-input>
                    <DictionarySelect v-model="detail[field.name]"
                        v-else-if="['Enum', 'Dictionary'].includes(field.type)" :dictionary="field.typeName" />
                    <el-date-picker v-else-if="['Date'].includes(field.type)" v-model="detail[field.name]" type="date"
                        placeholder="选择日期" :value-format="globalDateFormat">
                    </el-date-picker>
                    <el-select v-else-if="['ToMany'].includes(field.type) && toManySelectData[field.name]"
                        v-model="detail[field.name]" multiple :placeholder="`请选择${field.label}`"
                        :value-key="field.refData.split(',')[0]">
                        <el-option v-for="item in toManySelectData[field.name]" :key="item.key" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <DetailForm v-else-if="['ToOne'].includes(field.type)" :name="field.typeName"
                        :detail="detail[field.name]" :mode="mode" :value-format="globalDateFormat" />
                </el-form-item>
            </el-col>
            <slot name="fields" />
        </el-row>
    </el-form>
</template>
<script>
import { initMetadata, globalDateFormat,_addRule } from '@/utils/utils';
import DictionarySelect from '@/components/dictionary_select.vue';
export default {
    name: 'DetailForm',
    props: {
        name: {},
        detail: {},
        mode: {}, // create/update/readonly
        formCols: { type: Number, default: 1 },
        toManySelectData: { default: () => ({}) },
        customRules: { default: () => [] },
    },
    inject: {
        getCustomComponent: { default: {} }
    },
    components: { DictionarySelect },
    data() {
        return {
            globalDateFormat,
            rules: {},
            metadata: null,
        };
    },
    methods: {
        validate(callback) {
            return this.$refs['detail-form'].validate(callback);
        }
    },
    async created() {
        await initMetadata(this, null, this.name);
        this.customRules.forEach(rule => {
            _addRule(this, rule.name, rule);
        });
    }
}
</script>