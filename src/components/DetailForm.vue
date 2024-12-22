<template>
    <el-form ref="detail-form" :model="detail" label-position="right" label-width="120px" :rules="rules"
        class="input-form">
        <el-row>
            <slot name="fields"></slot>
            <template v-if="!$slots['fields']">
                <SingleEditor :meta="field.name" v-for="field in fields" />
            </template>
            <div style="margin:10px">
                <slot name="buttons"></slot>
            </div>
        </el-row>
    </el-form>
</template>
<script>
import { globalDateFormat } from '@/utils/utils';
import SingleEditor from '@/components/SingleEditor.vue';
export default {
    name: 'DetailForm',
    props: {
        name: {},
        detail: {},
        mode: {}, // create/update/readonly
        formCols: { type: Number, default: 1 },
        meta: { type: String, default: () => null },
    },
    inject: {
        getCustomComponent: { default: {} }
    },
    provide() {
        return {
            value: this.detail,
            formCols: this.formCols,
            mode: this.mode,
            entity: this.meta,
            formStyle: this.formStyle,
        };
    },
    components: { SingleEditor },
    data() {
        return {
            globalDateFormat,
            fields: [],
            rules: {},
        };
    },
    methods: {
        validate(callback) {
            return this.$refs['detail-form'].validate(callback);
        }
    },
    created() {
        this.fields = this.getEntityFields(this.meta, 'editable');
    }
}
</script>