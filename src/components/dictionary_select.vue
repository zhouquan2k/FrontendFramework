<template>
    <el-select :class="theClass" @change="onSelect" filterable :filter-method="filterMethod" :placeholder="placeholder"
        :value="value" :multiple="multiple" :clearable="clearable" :disabled="disabled" :collapse-tags="collapseTags">
        <el-option v-for="item, index in dictionaryData" v-if="item.tag != 'invisible'" :label="item.label"
            :value="item.value" :key="item.value" />
    </el-select>
</template>
<script>
import pinyin from "pinyin";
import { isValid } from "@/utils/utils";
export default {
    model: {
        prop: 'value',
        event: 'change',
    },
    props: {
        theClass: { default: () => null },
        emptyOption: { default: () => false },
        clearable: { default: () => true },
        collapseTags: { default: () => false },
        value: {},
        multiple: { default: () => false },
        dictionary: { type: String }, // dictinaryName
        placeholder: { default: () => '' },
        disabled: { default: () => false }
    },
    data() {
        return {
            dictionaryData: [],
        };
    },
    methods: {
        onSelect(event) {
            this.dictionaryData = this.$metadata.dictionaries[this.dictionary];
            this.$emit('change', !isValid(event) ? null : event);
        },
        filterMethod(val, param) {
            if (val && val != ' ') {
                this.dictionaryData = this.$metadata.dictionaries[this.dictionary]?.filter(item => {
                    let optionPinyin = pinyin(item.label, {
                        style: pinyin.STYLE_FIRST_LETTER
                    }).join('');
                    // 检查输入的拼音首字母是否匹配 或者 字符匹配
                    return optionPinyin.indexOf(val.toLowerCase()) === 0 || item.label.toLowerCase().indexOf(val.toLowerCase()) > -1;
                });
            } else {
                this.dictionaryData = this.$metadata.dictionaries[this.dictionary];
            }
        }
    },
    async created() {
        this.dictionaryData = this.$metadata.dictionaries[this.dictionary]
    }
};
</script>