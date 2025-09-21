import _request from '@/utils/request'
import store from '@/store'
import { getAccessToken } from '@/utils/auth'


export function isValid(value) {
  return value !== null && value !== undefined;
}

// 也可以使用lodash _.get(project,'a.b')， 已放入vue

export function safeGet(o, path) {
  return path?.split('.').reduce((o = {}, b) => o[b], o);
}

export function safeSet(o, path, newValue) {
  const paths = path.split('.');
  const last = paths.pop();
  // if path is not exist, create it
  const target = paths.reduce((o = {}, b) => o[b] = o[b] || {}, o);
  target[last] = newValue;
}

export function getForTemplate(tempalte, params) {
  return tempalte.replace(/\$\{(\w+)\}/g, (match, key) => {
    return params[key] ? params[key] : '';
  });
}

export function getManyItemLabel(item, fieldMeta) {
  const fields = fieldMeta.refData.split(',');
  return safeGet(item, fields[1]);
}

export function check(condition, message) {
  if (!condition) throw new Error(message);
}

export const globalDateFormat = 'yyyy-MM-dd';
export const globalDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';

export const getFieldDef = (entity, fieldName, metadata) => {
  const pos = fieldName ? fieldName.indexOf('.') : -1;
  if (pos < 0) return entity.fieldMap[fieldName];
  const fieldPart = fieldName.substring(0, pos);
  const field = entity.fieldMap[fieldPart];
  if (!field) throw new Error(`can't find field: ${fieldPart} in ${entity.name}`);
  const subEntity = metadata.entitiesMap[field.typeName];
  return getFieldDef(subEntity, fieldName.substring(pos + 1), metadata);
}

// 2nd parameter: fieldNames/field object array, or 'listable', 'searchable'
Vue.prototype.getEntityFields = function (entityName, fieldNames) {
  const entityMetadata = this.$metadata.entitiesMap[entityName];
  check(entityMetadata != null, `can't find entity: ${entityName}`);
  if (fieldNames == 'listable')
    return this.$metadata.entitiesMap[entityName].fields.filter(field => !field.hidden && field.listable);
  else if (fieldNames == 'searchable')
    return this.$metadata.entitiesMap[entityName].fields.filter(field => !field.hidden && field.searchable);
  else if (fieldNames == 'editable')
    return this.$metadata.entitiesMap[entityName].fields.filter(field => !field.hidden && (field.editable || field.type === 'IDStr'));

  if (!Array.isArray(fieldNames)) //single name
    return getFieldDef(entityMetadata, fieldNames, this.$metadata);

  const retFields = fieldNames.map(fieldName => {
    // 自定义的field对象
    if (typeof fieldName === "object" && !fieldName.name) return fieldName; //fullly customized
    var fieldDef = getFieldDef(entityMetadata, (typeof fieldName === "object") ? fieldName.name : fieldName, this.$metadata);
    return { ...fieldDef, ...((typeof fieldName === "object") ? fieldName : { name: fieldName }) };
  });
  console.log(`getEntityFields(${entityName})`, retFields);
  return retFields;
}

Vue.prototype.addRules = function (entityName, fieldDefs) {
  const entityMetadata = this.$metadata.entitiesMap[entityName];
  check(entityMetadata != null, `can't find entity: ${entityName}`)
  if (fieldDefs == 'detail')
    fieldDefs = entityMetadata.fields;

  fieldDefs.forEach(field => {
    const fieldDef = Object.assign({}, entityMetadata.fieldMap[field.name], field);
    if (!fieldDef.nullable && !fieldDef.hidden) _addRule(this, fieldDef.name, { required: true, message: `请输入'${fieldDef.label}'`, trigger: 'blur' });
  });
  console.log(this.rules);
}

// TODO param apis not used
export function initMetadata(object, apis, name) {
  if (name) {
    const ret_metadata = object.$metadata.entitiesMap[name];
    check(ret_metadata != null, `can't find ${name}`)
    ret_metadata.searchFields = ret_metadata.fields.filter(field => field.searchable);
    // ret_metadata.fieldMap = {};
    ret_metadata.fields.forEach(field => {
      // ret_metadata.fieldMap[field.name] = field;
      field.key = field.name;
      if (!field.nullable && !field.hidden) _addRule(object, field.name, { required: true, message: `请输入'${field.label}'`, trigger: 'blur' });
    });
    object.metadata = ret_metadata;
    const componentName = object.$options.name
    console.log(`${componentName}.${name} Entity: `, object.metadata);
    console.log(`${componentName}.${name} Rules: `, object.rules);
  }
  object.dictionaries = object.$metadata.dictionaries;
  if (object.dictionariesMap) {
    object.dictionariesMap = object.$metadata.dictionariesMap;
  }
}

export function _addRule(object, name, rule) {
  if (!object.rules) return;
  if (!object.rules[name])
    object.rules[name] = [];
  object.rules[name].push(rule);
}

export const defaultCrudActions = [
  {
    desc: "修改",
    event: "edit",
    method: 'showEditDialog',
    available: (row, This) => {
      return !This || !This.writePermission || This.hasPermission(This.writePermission);
    }
  },
  {
    desc: '删除',
    event: 'delete',
    method: 'showDeleteConfirm',
    available: (row, This) => !This || !This.writePermission || This.hasPermission(This.writePermission)
  }
];


// @Deprecated
export const defaultActionProc = function (action) {
  let crud = this.$refs.crud; //TODO how about ref other than crud?
  if (this[action.name]) {
    this[action.name](...action.params);
  }
  else if (crud[action.name])
    crud[action.name](...action.params);
};


export const getCurrentUser = function () {
  return store.state.user;
}

//树形结构需要每行有一个id，且还只能是固定的名字
const mappingId = (idField, result) => {
  if (!idField || !result) return;
  if (Array.isArray(result)) {
    result.forEach(item => mappingId(idField, item));
  }
  else {
    result.id = result[idField];
    if (result.children) mappingId(idField, result.children);
  }
}

import Element from 'element-ui';
function emptyIfNull(x) {
  return x ? '<br/>' + x : '';
}

export function globalErrorHandler(err, vm, info) {
  if (err == 'cancel') return; // it's a confirm.cancel
  if (err._handled) return;
  err._handled = true;
  console.error('*** Error:', err, vm, info);
  let errCode = err?.response?.data.errCode;
  let errInfo = err?.response?.data.message;
  if (err.errCode) {
    errCode = err.errCode;
    errInfo = err.message;
  }

  let simpleMessage = err?.response?.data?.httpStatus == 500 ? null : errInfo;
  switch (errCode) {
    case 'Forbidden.BadCredentialsException':
      simpleMessage = '错误的用户名或密码';
      break;
    case 'Forbidden.PermissinDenied':
      simpleMessage = '无权访问';
      break;
  }
  if (simpleMessage) {
    Element.Message({
      // dangerouslyUseHTMLString: true,
      message: `${simpleMessage} ` + ((errInfo != simpleMessage) ? `(${errInfo})` : ''),
      type: 'warning',
      duration: 15000,
      showClose: true,
      center: false
    });
  }
  else {
    Element.Message({
      dangerouslyUseHTMLString: true,
      message: `<span style="font-weight:bold">${err.name == 'AxiosError' ? `后端异常:   ${err.config?.url}` : err.name}</span> \n\n ${err.code ?? ''} - ${err.message ?? ''} \n\n  ${(err?.response?.data.message ?? '-')} \n`.replace(/\n/g, '<br/>'),
      type: 'error',
      duration: 0,
      showClose: true,
      center: true
    });
  }
}

export function request(options) {
  const resetFlag = (obj, loading) => { if (obj && loading) obj[loading] = false };
  // common request handler
  if (options.This && options.loading) options.This[options.loading] = true;
  return _request({ baseURL: process.env.VUE_APP_BASE_API, ...options }).then(response => {
    // common response handler: if header.content-type is json
    resetFlag(options.This, options.loading);
    if (response.headers?.['content-type'] === 'application/json') {  
      mappingId(options.idField, response.result);
      return response.result;
    } else {
      return response;
    }
  }).catch(error => {
    // common exception handler
    resetFlag(options.This, options.loading);
    if (!options.noPopup)
      globalErrorHandler(error);
    throw error;
  });
}

export function getAuthHeader() {
  return { 'Authorization': 'Bearer ' + getAccessToken() };
}

const AdminPermission = "security.***";
export function hasPermission(permission, location, allPermissions) {
  let permString = permission; // required permission
  if (location) permString += `@${location}`;
  if (!allPermissions) allPermissions = store.getters && store.getters.permissions;
  // TODO 不能写成perm.startsWith(permission)会导致错误的匹配其他项目的权限
  var ret = allPermissions && (allPermissions.some(perm => perm === permString
    || (perm.endsWith("@") && perm.substring(0, perm.length - 1) == permission) // xxxx@: has permission for all locations when it's permission support location
    || `${perm}@${location}` == permString // xxx: has permission for all locations if permission not a permission need location. 
    || allPermissions.indexOf(AdminPermission) >= 0));
  //console.log(">>>>>",permission,location,ret);
  return ret;
}

export function trimProcess(object) {
  Object.keys(object).map(field => {
    if (object[field] && typeof (object[field]) == 'string') {
      object[field] = object[field].trim();
    }
  });
  return object;
}

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "H+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds()             //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

export function moneyFormatter(x, y, value) {
  return value ? value.toFixed(2) : '';
}

// 需要重构，跟tableDateFormatter合并 不能被用在table里
export function dateFormatter(x, y, value, meta) {
  return !meta || meta.type == 'Date' ? value?.substring(0, 10) : value;
}

export function dateFormatter2(value, meta) {
  return !meta || meta.type == 'Date' ? value?.substring(0, 10) : value;
}

export function tableDateFormatter(x, y, value, index) {
  return value?.substring(0, 10);
}

//TODO is really formatter?
export function booleanFormatter(value) {
  return value ? "是" : "否";
}

Vue.prototype.dictFormatter = function (type, value) {
  return this.$metadata.dictionariesMap[type][value]?.label;
}

export function startTime(d, days = 0) {
  const newDate = new Date(d);
  // console.log(d);
  newDate.setDate(d.getDate() + days);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function notImplemented(vue) {
  vue.$message('NOT IMPLEMENTED !');
}

export function generateUniqueKey() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function handleGroupbyRows(data, columns, groupByColumns) {
  // 对data进行分组统计, data已按分组字段排序，需要在data中添加分组小计的行
  if (!groupByColumns) return data;
  const res = [];
  let lastGroup = null;
  let group = null;
  let groupTotal = {};
  for (const row of data) {
    group = groupByColumns.map(col => safeGet(row, col)).join(','); //value of group by columns
    if (group !== lastGroup) {
      if (lastGroup) {
        res.push({ ...groupTotal, _isGroupTotal: true });
        groupTotal = {};
      }
      lastGroup = group;
    }
    for (const col of columns) {
      if (col.type === 'Integer' || col.type === 'Decimal') {
        safeSet(groupTotal, col.name, (safeGet(groupTotal, col.name) || 0) + (safeGet(row, col.name) || 0));
      }
      else
        safeSet(groupTotal, col.name, safeGet(row, col.name));
    }
    res.push(row);
  }
  if (group) {
    res.push({ ...groupTotal, _isGroupTotal: true });
  }
  return res;
}

import Vue from 'vue';
Vue.prototype.$success = function (msg) {
  this.$notify({
    title: '成功',
    message: msg,
    type: 'success'
  });
};

Vue.prototype.$warning = function (msg) {
  this.$notify({
    title: '警告',
    message: msg,
    type: 'warning'
  });
};

Vue.prototype.$Confirm = async function (confirmMessage) {
  await this.$confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
}

Vue.prototype.$refreshToUrl = function (url, replace) {
  const queryString = new URLSearchParams(this.$route.query).toString();
  const currentUrl = this.$route.path;
  if (url == currentUrl || !url) {
    this.$router.replace('/').then(() => {
      this.$router.replace(url);
    });
  }
  else {
    if (replace) this.$router.replace(url);
    else this.$router.push(url);
  }
}

// pass event to parent listener if exists
Vue.prototype.$defaultActionEmit = function (event, row) {
  if (this.$listeners[event]) {
    this.$emit(event, row);
    return true;
  }
  return false;
}

Vue.prototype.$dictLabel = function (dictName, value) {
  return this.$metadata.dictionariesMap[dictName]?.[value]?.label;
}
