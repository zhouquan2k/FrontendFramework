<template>
    <div :style="tableStyle">
        <div class="grid-toolbar" v-if="toolbarVisible">
            <div style="display: flex;width: 90%;">
                <i v-if="searches?.length > 0" class="el-icon-arrow-right"
                    style="color:#409EFF;margin-top:5px;margin-left:5px;" @click="searchVisible = !searchVisible"></i>
                <el-form v-show="searchVisible && searches?.length > 0" inline class="search-form" v-model="searchForm">
                    <!-- 可以根据searches 里面的成员看哪些是已经定制显示了的，从而不再绘制-->
                    <el-form-item v-for="field in searches" :key="field.name"
                        v-if="$scopedSlots[`searches-${field.name}`] || !field.hidden && ['ID', 'IDStr', 'Integer', 'String', 'Enum', 'Dictionary', 'Date', 'Timestamp'].includes(field.type) && !fixedSearchParams[field.name]">
                        <template v-if="$scopedSlots[`searches-${field.name}`]">
                            <slot :name="`searches-${field.name}`"></slot>
                        </template>
                        <el-input v-model="searchForm[field.name]" v-else-if="['ID', 'IDStr'].includes(field.type)"
                            class="search-input" :placeholder="field.label" @keyup.enter.native="onSearch" />
                        <el-input v-model="searchForm[field.name]" v-else-if="['Integer'].includes(field.type)"
                            class="search-input" :placeholder="field.label" @keyup.enter.native="onSearch"></el-input>
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
                    <el-form-item>
                        <el-button type="primary" plain @click="onSearch">搜索</el-button>
                        <el-button @click="onReset">重置</el-button>
                        <el-button v-if="exportVisible" type="warning" plain @click="onExport">导出</el-button>
                        <el-button v-if="printVisible" plain @click="onPrint">打印</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <slot name="buttons">
            </slot>
        </div>
        <div :id="tableId" class="print-content">
            <h3 v-if="title">{{ titleText }}</h3>
            <el-table :id="tableId" :key="tableUpdateKey" ref="table" class="main-table" :data="list" :row-key="idCol" v-loading="loading"
                :default-expand-all="false" @selection-change="handleSelectionChange" @row-dblclick="handleDblClick"  @row-click="handleRowClick"
                :row-class-name="rowClassName" @expand-change="row => $emit('expand-change', row)" :empty-text="emptyText"
                :highlight-current-row="highlightCurrentRow" @current-change="row => $emit('current-change', row)"
                :summary-method="summaryMethod ?? defaultSummaryMethod" :show-summary="showSummary" :size="size"
                :highlight-selection-row="highlightSelectionRow">
                <el-table-column v-if="checkboxVisible" type="selection" width="55" />
                <el-table-column type="expand" v-if="$scopedSlots['expand']" width="20">
                    <template slot-scope="scope">
                        <slot name="expand" :data="scope.row" />
                    </template>
                </el-table-column>
                <el-table-column :prop="field.name" :label="field.label" v-for="field in columns" :key="field.name"
                    :width="field.colWidth" :sortable="showSort"
                    :filter-method="filters.includes(field.name) ? filterMethod : null" :filters="getFilters(field.name)">
                    <template slot-scope="scope">
                        <template v-if="$scopedSlots[`columns-${field.name}`]">
                            <slot :name="`columns-${field.name}`" :data="scope.row"></slot>
                        </template>
                        <DictionaryTag
                            v-else-if="['Enum', 'Dictionary'].includes(field.type) && isValid(safeGet(scope.row, field.name))"
                            :value="safeGet(scope.row, field.name)"
                            :dictName="field.type == 'Dictionary' ? field.typeName?.split(':')[1] : field.typeName" tag />
                        <span v-else-if="['RefID'].includes(field.type) && isValid(safeGet(scope.row, field.name))">
                            {{ field.refData && field.refData.startsWith('dictionary:') ?
            $metadata.dictionariesMap[field.refData.substring(11)]?.[safeGet(scope.row, field.name)]?.label
            :
            safeGet(scope.row,
                field.refData) }}</span>
                        <span v-else-if="['Date', 'Timestamp'].includes(field.type)">{{ dateFormatter(0, 0,
            safeGet(scope.row, field.name), field)
                            }}</span>
                        <span v-else-if="field.render">{{ field.render(scope.row) }}</span>
                        <span v-else>{{ safeGet(scope.row, field.name) }}</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="actions && actions.length > 0" label="操作" fixed="right"
                    :width="actions.length > 2 ? 200 : actions.length * 70">
                    <template slot-scope="scope">
                        <el-button :name="`${action.desc}`"
                            v-for="action in availableActions(scope.row).slice(0, actionCntToHide)"
                            :key="`button-${action.event}`" v-if="!action.available || action.available(scope.row)"
                            type="text" :style="action.style" @click="callMethod(action.event, scope.row)">{{ action.desc
                            }}</el-button>
                        <el-dropdown v-if="availableActions(scope.row).length > actionCntToHide"
                            @command="command => callMethod(command, scope.row)">
                            <span class="el-dropdown-link">
                                更多<i class="el-icon-d-arrow-right el-icon--left" />
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item v-for="action in availableActions(scope.row).slice(actionCntToHide)"
                                    :command="action.event" v-if="!action.available || action.available(scope.row)"
                                    size="mini" type="text" :icon="action.icon" :key="action.name">{{
                                    action.desc
                                    }}</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import { dateFormatter, safeGet, hasPermission, globalDateFormat, isValid, handleGroupbyRows } from "@/utils/utils";
import DictionarySelect from '@/components/dictionary_select';
import DictionaryTag from '@/components/dictionary_tag.vue';
import * as XLSX from 'xlsx';
export default {
    name: 'SimpleTable',
    props: {
        idCol: { default: () => 'id' },
        tableId: { default: () => 'theTable' },
        columns: { type: Array },
        data: { type: Array, default: () => null },
        groupByColumns: { type: Array, default: () => null },
        groupTotalColumns: { type: Array, default: () => [] },
        searchMethod: { type: Function },
        actions: { type: Array, default: () => ([]) },
        buttons: { type: Array, default: () => ([]) },
        searches: { type: Array, default: () => ([]) },
        searchParams: { type: Object, default: () => ({}) }, // searchForm的初值，可变
        fixedSearchParams: { type: Object, default: () => ({}) }, // 外部控制的参数
        toolbarVisible: { type: Boolean, default: () => true },
        searchVisible: { type: Boolean, default: () => false },
        checkboxVisible: { type: Boolean, default: () => false },
        exportVisible: { type: Boolean, default: () => false },
        printVisible: { type: Boolean, default: () => false },
        actionCntToHide: { type: Number, default: () => 2 },
        rowClassName: { default: () => null }, //function or string, pass 
        emptyText: { default: () => null },
        summaryMethod: { default: () => null },
        showSummary: { default: () => false },
        size: { default: () => '' },
        tableStyle: { default: () => null },
        showSort: { default: () => true },
        loading: { default: () => false },
        highlightCurrentRow: { default: () => true },
        highlightSelectionRow: { type: Boolean, default: () => false },
        filters: { type: Array, default: () => [] },
        title: { default: () => null },
    },
    computed: {
        titleText() {
            return typeof this.title === 'function' ? this.title(this.list) : this.title;
        }
    },
    watch: {
        fixedSearchParams: {
            handler(newVal) {
                //if (this.autoSearch)
                this.onSearch();
            },
            deep: true,
        },
        data: {
            handler(newVal) {
                this.list = newVal;
            },
            deep: true,
        }
    },
    components: { DictionarySelect, DictionaryTag },
    data() {
        return {
            globalDateFormat,
            list: [],
            searchForm: {},

            dateFormatter,
            tableUpdateKey: 2617,
        };
    },
    methods: {
        isValid, safeGet,
        filterMethod(value, row, column) {
            console.log('filtering...', value, row, column);
            return row[column.property] === value;
        },
        getFilters(column) {
            if (this.list && this.filters.includes(column)) {
                const uniqueValues = [...new Set(this.list.map(item => item[column]))];
                return uniqueValues.map(item => ({ text: item, value: item })).slice(0, 10);
            }
            return null;

        },
        onExport() {
            const columns = this.$refs.table.columns;
            const headers = columns.filter(col => col.label && col.property).map(col => col.label);
            const data = this.list.map(row => columns.filter(col => col.label).map(col => {
                const theCol = this.columns.find(c => c.name === col.property);
                if (theCol?.type === 'Enum' || theCol?.type === 'Dictionary' || theCol?.type === 'RefID')
                    return this.dictFormatter(theCol?.type === 'RefID' ? theCol.refData.startsWith('dictionary:') ? theCol.refData.substring(11) : theCol.refData : theCol.typeName, safeGet(row, theCol.name));
                return safeGet(row, col.property);
            }));
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, "export.xlsx");
        },
        onPrint() {
            this.$print({
                printable: this.tableId,
                targetStyles: ['*'],
                type: 'html'
            });
        },
        hasPermission,
        availableActions(param) {
            return this.actions.filter(action => !action.available || action.available(param));
        },
        callMethod(event, row) {
            // this.$emit('action', { name: methodName, params: params });
            this.$emit(event, row);
        },
        toggleRowExpansion(row, expanded) {
            this.$refs.table.toggleRowExpansion(row, expanded);
        },
        toggleRowSelection(row, selected) {
            this.$refs.table.toggleRowSelection(row, selected);
        },
        onReset() {
            this.searchForm = { ...this.searchParams };
            this.$emit('reset');
            this.onSearch();
        },
        async onSearch() {
            if (this.data) {
                this.list = this.data;
                return;
            }
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
                const list = await this.searchMethod({ ...flatten(this.searchForm), ...flatten(this.fixedSearchParams) });
                this.list = handleGroupbyRows(list, this.groupTotalColumns, this.groupByColumns);
            }
        },
        handleSelectionChange(data) {
            this.$emit('selection-change', data);
        },
        handleDblClick(data) {
            this.$emit('row-dblclick', data);
        },
        handleRowClick(data) {
            this.$emit('row-click', data);
        },
        refreshTable() {
            this.tableUpdateKey++;
        },
        defaultSummaryMethod(param) {
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '记录数：' + data.length;
                    return;
                }
                /* TODO according to column metadata
                const values = data.map(item => Number(item[column.property]));
                if (!values.every(value => isNaN(value))) {
                    sums[index] = values.reduce((prev, curr) => {
                    const value = Number(curr);
                    if (!isNaN(value)) {
                        return prev + curr;
                    } else {
                        return prev;
                    }
                    }, 0);
                    // sums[index] += ' 元';
                } else {
                    // sums[index] = 'N/A';
                }
                */
            });

            return sums;
        }

    },
    mounted() {
        this.searchForm = { ...this.searchParams };
        this.onSearch();
    }
};
</script>

<style lang="scss" scoped>
/*
# .el-form-item {
    margin-right: 10px;
}
*/
@media print {
    /*
      @page {
        size: landscape;
        margin: 10mm;
      }
      */
      body {
        width: 100%;
        margin: 0;
        padding: 0;
      }
      /* 让打印的内容自适应整个页面宽度 */
      .print-content {
        width: 100%;
      }
    }

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
}

.search-input {
    width: 100px;
    line-height: 20px;
    height: 28px;
}

.search-input>>>.el-input--small .el-input__inner {
    height: 28px;
    line-height: 28px;
}

.search-form {
    .el-range-editor {
        height: 31px;
        width: 220px;
        margin-top: 1px;
    }

    .el-select {
        width: 140px;
    }
}

.grid-toolbar {
    display: flex;
    justify-content: space-between;
    height: 30px;
    margin-top: 3px;
    margin-bottom: 3px;
}
</style>