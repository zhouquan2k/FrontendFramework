<template>
    <div>
        <div class="grid-toolbar" v-if="toolbarVisible">
            <div style="display: flex;width: 80%;">
                <el-form v-show="searchVisible" inline class="search-form" v-model="searchForm">
                    <slot name="searches" :data="searchForm"></slot>
                    <template v-if="!$scopedSlots.searches">
                        <el-form-item v-for="field in searches" :key="field.name"
                            v-if="$scopedSlots[`searches-${field.name}`] || !field.hidden && ['ID', 'IDStr', 'Integer', 'String', 'Enum', 'Dictionary', 'Date', 'Timestamp'].includes(field.type) && !fixedSearchParams[field.name]">
                            <template v-if="$scopedSlots[`searches-${field.name}`]">
                                <slot :name="`searches-${field.name}`"></slot>
                            </template>
                            <el-input v-model="searchForm[field.name]" v-else-if="['ID', 'IDStr'].includes(field.type)"
                                class="search-input" :placeholder="field.label" @keyup.enter.native="onSearch" />
                            <el-input v-model="searchForm[field.name]" v-else-if="['Integer'].includes(field.type)"
                                class="search-input" :placeholder="field.label"
                                @keyup.enter.native="onSearch"></el-input>
                            <el-input v-model="searchForm[field.name]" v-else-if="['String'].includes(field.type)"
                                :placeholder="field.label" class="search-input" @keyup.enter.native="onSearch" />
                            <el-date-picker v-model="searchForm[field.name]" :value-format="globalDateFormat"
                                v-else-if="['Date', 'Timestamp'].includes(field.type)" class="search-input"
                                :placeholder="field.label" type="daterange" @change="onSearch" range-separator="-"
                                start-placeholder="开始" :end-placeholder="`结束${field.label}`">
                            </el-date-picker>
                            <DictionarySelect :theClass="field.name" v-model="searchForm[field.name]"
                                :dictionary="field.typeName" v-else-if="['Enum', 'Dictionary'].includes(field.type)"
                                :placeholder="field.label" :clearable="true" :multiple="true" :collapseTags="true" />
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button type="primary" plain @click="onSearch" style="margin-left: 10px">搜索</el-button>
                        <el-button @click="onReset">重置</el-button>
                        <el-button v-if="exportVisible" type="warning" plain @click="onExport">导出</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <slot name="buttons"></slot>
            </div>
        </div>

        <el-table :key="tableUpdateKey" ref="table" class="main-table" :data="list" :row-key="getRowKey"
            :default-expand-all="false" @selection-change="handleSelectionChange" @row-dblclick="handleDblClick"
            :row-class-name="rowClassName" @expand-change="row => $emit('expand-change', row)" :empty-text="emptyText"
            :highlight-current-row="true" @current-change="row => $emit('current-change', row)"
            :summary-method="summaryMethod ?? defaultSummaryMethod" :show-summary="showSummary" v-on="$listeners">
            <el-table-column v-if="checkboxVisible" type="selection" width="55" />
            <el-table-column type="expand" v-if="$scopedSlots['expand']" width="20">
                <template slot-scope="scope">
                    <slot name="expand" :data="scope.row" />
                </template>
            </el-table-column>
            <el-table-column v-if="indexColumnWidth > 0" type="index" :width="indexColumnWidth" />
            <slot name="columns"></slot>
            <template v-if="!$slots['columns']">
                <el-table-column :prop="field.name" :label="field.label" v-for="field in columns" :key="field.name"
                    :width="field.colWidth" sortable>
                    <template slot-scope="scope">
                        <template v-if="$scopedSlots[`columns-${field.name}`]">
                            <slot :name="`columns-${field.name}`" :data="scope.row"></slot>
                        </template>
                        <DictionaryTag
                            v-else-if="['Enum', 'Dictionary'].includes(field.type) && isValid(safeGet(scope.row, field.name))"
                            :value="safeGet(scope.row, field.name)" :dictName="field.typeName" tag />
                        <span v-else-if="['RefID'].includes(field.type) && isValid(safeGet(scope.row, field.name))">
                            {{ field.refData && field.refData.startsWith('dictionary:') ?
            $metadata.dictionariesMap[field.refData.substring(11)]?.[safeGet(scope.row,
                field.name)]?.label
            :
            safeGet(scope.row,
                field.refData) }}</span>
                        <span v-else-if="['Date', 'Timestamp'].includes(field.type)">{{ dateFormatter(0, 0,
            safeGet(scope.row, field.name), field)
                            }}</span>
                        <span v-else>{{ safeGet(scope.row, field.name) }}</span>
                    </template>
                </el-table-column>
            </template>
            <el-table-column v-if="actions && actions.length > 0" label="操作" fixed="right" width="150">
                <template slot-scope="scope">
                    <el-button :name="`${action.desc}`"
                        v-for="action in availableActions(scope.row).slice(0, actionCntToHide)"
                        :key="`button-${action.event}`"
                        type="text" :style="action.style" @click="callMethod(action.event, scope.row)">{{ action.desc
                        }}</el-button>
                    <el-dropdown v-if="availableActions(scope.row).length > actionCntToHide"
                        @command="command => callMethod(command, scope.row)">
                        <span class="el-dropdown-link">
                            更多<i class="el-icon-d-arrow-right el-icon--left" />
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-for="action in availableActions(scope.row).slice(actionCntToHide)"
                                :command="action.event" 
                                size="mini" type="text" :icon="action.icon" :key="action.name">{{
            action.desc
        }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-if="dialogVisible" :title="`${label} - ${dialogTitle}`" :visible.sync="dialogVisible" :close-on-click-modal="false">
            <DetailForm ref="detail-form" :name="meta" :meta="meta" :detail="detail" :formCols="formCols" :mode="mode">
                <template #fields>
                    <slot name="fields" :data="detail"></slot>
                </template>
            </DetailForm>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false" v-if="oneTimeSave">关闭</el-button>
                <el-button @click="dialogVisible = false" v-if="!oneTimeSave">取消</el-button>
                <el-button type="primary" @click="$emit('do-save', detail); dialogVisible = false"
                    v-if="mode != 'readonly' && !oneTimeSave">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { dateFormatter, safeGet, hasPermission, globalDateFormat, isValid } from "@/utils/utils";
import DictionarySelect from '@/components/dictionary_select';
import DictionaryTag from '@/components/dictionary_tag.vue';
import DetailForm from './DetailForm.vue';
import * as XLSX from 'xlsx';
export default {
    name: 'SimpleTable2',
    props: {
        meta: { type: String },
        label: { default: () => '' }, // entity's name
        data: { type: Array, default: () => null },
        // idCol: { default: () => 'id' },
        formCols: { type: Number, default: () => 1 },
        searchMethod: { type: Function },
        actions: { type: Array, default: () => ([]) },
        searchParams: { type: Object, default: () => ({}) }, // searchForm的初值，可变
        fixedSearchParams: { type: Object, default: () => ({}) },
        toolbarVisible: { type: Boolean, default: () => true },
        searchVisible: { type: Boolean, default: () => true },
        checkboxVisible: { type: Boolean, default: () => false },
        exportVisible: { type: Boolean, default: () => false },
        indexColumnWidth: { type: Number, default: () => 0 },
        actionCntToHide: { type: Number, default: () => 2 },
        rowClassName: { default: () => null }, //function or string, pass 
        emptyText: { default: () => null },
        summaryMethod: { default: () => null },
        showSummary: { default: () => false },
        refreshKey: { default: () => 0 },
        oneTimeSave: { type: Boolean, default: () => true },
        showDialog: { type: String },
        writePermission: { type: String, default: () => null },
    },
    watch: {
        fixedSearchParams: {
            handler(newVal) {
                //if (this.autoSearch)
                this.onSearch();
            },
            deep: true,
        },
        refreshKey: {
            handler(newVal) {
                this.onSearch();
            },
        },
        showDialog: {
            handler(newVal) {
                if (newVal == 'add') {
                    this.showAddDialog();
                }
            },
        },
        data: {
            handler(newVal) {
                this.list = newVal;
            },
        }
    },
    components: { DictionarySelect, DictionaryTag, DetailForm },
    data() {
        return {
            globalDateFormat,
            list: [],
            searchForm: {},
            columns: [],
            searches: [],
            dialogVisible: false,
            detail: null,

            dateFormatter,
            tableUpdateKey: 2617,
        };
    },
    methods: {
        isValid, safeGet,
        getRowKey(row, index) {
            return index; // 使用索引作为key
        },
        onExport() {
            // TODO call searchMethod get whole data instead of current page
            const columns = this.$refs.table.columns;
            const headers = columns.filter(col => col.label && col.property).map(col => col.label);
            const data = this.list.map(row => columns.filter(col => col.label && col.property).map(col => {
                const theCol = this.columns.find(c => c.name === col.property);
                if (theCol?.type === 'Enum' || theCol?.type === 'Dictionary' || theCol?.type === 'RefID')
                    return this.dictFormatter(theCol?.type === 'RefID' ? theCol.refData.startsWith('dictionary:') ? theCol.refData.substring(11) : theCol.refData : theCol.typeName, safeGet(row, theCol.name));
                return safeGet(row, col.property);

            }));
            // 创建工作簿
            const wb = XLSX.utils.book_new();
            // 将数据转换为工作表
            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            // 将工作表添加到工作簿
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            // 导出工作簿（在浏览器环境中会触发下载）
            XLSX.writeFile(wb, "export.xlsx");
        },
        hasPermission,
        availableActions(param) {
            return this.actions.filter(action => !action.available || action.available(param, this));
        },
        callMethod(event, row) {
            if (this.$defaultActionEmit(event, row)) return;
            // 默认实现为在线编辑（一次保存）
            if (event == 'edit') {
                this.showEditDialog(row);
            } else if (event == 'delete') {
                this.onDelete(row);
            } else if (event == 'detail') {
                this.showDetailDialog(row);
            }
        },
        onReset() {
            this.searchForm = { ...this.searchParams };
            this.$emit('reset');
            this.onSearch();
        },
        async onSearch() {
            for (const key in this.searchForm) {
                if (this.searchForm[key] === "") delete this.searchForm[key];
            }
            for (const key in this.searchParams) {
                if (this.searchParams[key] === "") delete this.searchParams[key];
            }
            const flatten = (obj) => {
                const res = {};
                for (const key in obj) {
                    const pos = key.lastIndexOf('.');
                    res[pos < 0 ? key : key.substring(pos + 1)] = obj[key];
                }
                return res;
            };
            console.log('searching...', JSON.stringify(this.searchForm), JSON.stringify(this.fixedSearchParams));
            if (this.searchMethod) {
                this.list = await this.searchMethod({ ...flatten(this.searchForm), ...flatten(this.fixedSearchParams) });
            }
        },
        handleSelectionChange(data) {
            this.$emit('selection-change', data);
        },
        handleDblClick(data) {
            this.$emit('row-dblclick', data);
        },
        refreshTable() {
            this.tableUpdateKey++;
        },
        defaultSummaryMethod(param) {
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = `记录数: ${data.length}`;
                }
                else if (index == 1) {
                    sums[index] = '合计:';
                }
                if (['Integer', 'Decimal'].includes(this.getEntityFields(this.meta, column.property)?.type)) {
                    sums[index] = data.reduce((sum, item) => sum + parseInt(item[column.property], 10), 0);
                    return;
                }
            });
            return sums;
        },
        // 增删改查的所有功能
        showAddDialog(current) {
            const record = { parentId: current ? current[this.metadata.idField] : null };
            this.$metadata.entitiesMap[this.meta].fields.forEach(field => record[field.name] = field.defaultValue ? field.defaultValue : null);
            this.detail = record;
            this.mode = 'create';
            this.dialogTitle = '新建';
            this.dialogVisible = true;
        },
        showEditDialog(row) {
            const record = this.oneTimeSave ? row : { ...row }; // TODO
            this.$metadata.entitiesMap[this.meta].fields.forEach(field => { if (!Object.hasOwn(record, field.name)) record[field.name] = field.defaultValue ? field.defaultValue : null });
            this.$set(this, 'detail', record);
            this.mode = 'update';
            this.dialogTitle = '编辑';
            this.dialogVisible = true;
        },
        showDetailDialog(row) {
            this.detail = row;
            this.dialogTitle = '详情';
            this.mode = 'readonly';
            this.dialogVisible = true;
        },
        onDelete(detail) {
            this.detail = detail;
            this.$confirm('确定删除该记录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if (this.oneTimeSave) {
                    const index = this.list.findIndex(item => item === detail);
                    if (index !== -1) {
                        this.list.splice(index, 1);
                    }
                }
                else {
                    this.$emit('do-delete', detail);
                }
            });
        },
    },
    mounted() {
        if (this.data) {
            this.list = this.data;
        }
        if (!this.meta) return;
        this.columns = this.getEntityFields(this.meta, 'listable');
        this.searches = this.getEntityFields(this.meta, 'searchable');
        this.searchForm = { ...this.searchParams };
        this.onSearch();
    }
};
</script>

<style lang="scss" scoped>
.el-dropdown-link {
    margin-left: 10px;
    font-size: 12px;
    color: #409EFF;
}

.search-form {
    margin-left: 10px;
    display: flex;
    /* margin-right: auto; */
    margin-top: -2px;
    width: 100%;

    ::v-deep .el-button--small {
        padding: 9px 12px;
        margin-right: 8px;
        margin-left: 0px;
    }

    ::v-deep .el-input {
        width: 120px;
        margin-left: 5px;
    }

    ::v-deep .el-select {
        width: 160px;

        .el-input {
            width: 150px;
        }
    }

    ::v-deep .el-range-editor {
        height: 31px;
        width: 220px;
        margin-top: 1px;
        margin-left: 5px;
    }
}

.grid-toolbar {
    display: flex;
    justify-content: space-between;
    height: 30px;
    margin-top: 5px;
    margin-bottom: 5px;
}

::v-deep .el-table__footer-wrapper {
    font-weight: bold;
}
</style>