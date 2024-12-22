<template>
    <el-col :key="`col-${theName}`" :span="24 / (type == 'Text' ? 1 : formCols)">
        <el-form-item :name="theName" :label="theLabel" :prop="theName">
            <span v-if="mode == 'readonly' || theType == 'Timestamp'">{{ safeGet(value, theName) }}</span>
            <el-input :value="safeGet(value, theName)" v-else-if="['Integer', 'Decimal'].includes(theType)"
                style="width:100px;" @input="(newValue) => safeSet(value, theName, newValue)"></el-input>
            <el-input :type="theType == 'Text' ? 'textarea' : 'text'" :value="safeGet(value, theName)"
                @input="(newValue) => safeSet(value, theName, newValue)"
                v-else-if="['String', 'Text', 'IDStr'].includes(theType)"></el-input>
            <DictionarySelect :value="safeGet(value, theName)" v-else-if="['Enum', 'Dictionary'].includes(theType)"
                :dictionary="theDictionary" @change="(newValue) => safeSet(value, theName, newValue)" />
            <el-date-picker v-else-if="['Date'].includes(theType)" :value="safeGet(value, theName)" type="date"
                placeholder="选择日期" :value-format="globalDateFormat"
                @input="(newValue) => safeSet(value, theName, newValue)">
            </el-date-picker>
        </el-form-item>
    </el-col>
</template>
<script>
import { globalDateFormat, getFieldDef, safeGet, safeSet } from '@/utils/utils';
import DictionarySelect from '@/components/dictionary_select.vue';
export default {
    name: 'SingleEditor',
    inject: ['value', 'formCols', 'mode', 'entity', 'formStyle'],
    props: {
        meta: { type: String, default: () => null },
        label: { default: () => null },
        name: { default: () => null },
        type: { default: () => null },
        dictionary: { default: () => null },
    },
    components: { DictionarySelect },
    data() {
        return {
            theLabel: '',
            theName: '',
            theType: '',
            theDictionary: '',

            globalDateFormat,
            rules: {},
            metadata: null,
        };
    },
    methods: {
        safeGet, safeSet,
        init() {
            if (this.meta) {
                const entityMeta = this.$metadata.entitiesMap[this.entity];
                const fieldMeta = getFieldDef(entityMeta, this.meta, this.$metadata);
                this.theLabel = this.label || fieldMeta?.label;
                this.theName = this.name || this.meta;
                this.theType = this.type || fieldMeta?.type;
                this.theDictionary = this.dictionary || fieldMeta?.typeName;
            }
            else {
                this.theLabel = this.label;
                this.theName = this.name;
                this.theType = this.type;
                this.theDictionary = this.dictionary;
            }
        }
    },
    created() {
        this.init();
    }
}
</script>