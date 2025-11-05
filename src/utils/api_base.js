import { request } from '@/utils/utils'

const lang = navigator.language || navigator.userLanguage;
export let g_allMetadata = null;

export function getAllMetadata() {
    return request({
        url: `/public/metadata`,
        method: 'get',
        params: { lang }
    }).then(response => {
        // 处理响应数据并设置全局变量
        const allMetadata = { dictionariesMap: {} };
        allMetadata.entitiesMap = response.entities.reduce((obj, item) => {
            obj[item.name] = item;
            item.fieldMap = item.fields.reduce((map, field) => {
                map[field.name] = field;
                return map;
            }, {});
            return obj;
        }, {});

        allMetadata.dictionaries = response.dictionaries;
        for (const [key, dict] of Object.entries(response.dictionaries)) {
            var dictMap = {}
            for (var item of dict) {
                dictMap[item.value] = { label: item.label, tag: item.tag, value: item.value };
            }
            allMetadata.dictionariesMap[key] = dictMap;
        }

        g_allMetadata = allMetadata;
        return allMetadata;
    });
}

export async function getServerEnv() {
    return await request({
        url: `/public/env`,
        method: 'get'
    });
}

export default class CrudApi {
    constructor(baseUrl, metaName) {
        this.baseUrl = baseUrl;
        if (metaName)
            this.metadata = g_allMetadata?.entitiesMap?.[metaName];
    }

    async get(id, options) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'get',
            ...options
        });
    }

    async search(object, options) {
        return await request({
            url: `${this.baseUrl}/search`,
            method: 'post',
            data: object,
            ...options
        });
    }

    async list(params, options) {
        return await request({
            url: `${this.baseUrl}`,
            method: 'get',
            params: params,
            ...options
        });
    }

    async create(object, options) {
        return await request({
            url: `${this.baseUrl}`,
            method: 'post',
            data: object,
            ...options
        });
    }
    async update(id, object, options) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'put',
            data: object
        });
    }

    async save(object, options) {
        if (!this.metadata) throw new Error("MetaName is required for save operation");
        const idField = this.metadata.idField;
        const id = object[idField];
        if (id) {
            return await this.update(id, object, options);
        } else {
            return await this.create(object, options);
        }
    }
            
    async delete(id, options) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'delete',
            ...options
        });
    }
}
