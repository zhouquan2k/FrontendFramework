<template>
    <el-tag v-if="tag && value" :type="$metadata.dictionariesMap[dictName]?.[value]?.tag">{{
        $metadata.dictionariesMap[dictName]?.[value]?.label
    }}
    </el-tag>
    <span v-else>{{ $metadata.dictionariesMap[dictName]?.[value]?.label }}</span>
</template>
<script>
export default {
    props: {
        value: { required: true },
        dictName: { type: String, required: true },
        tag: { type: Boolean, default: true }
    },
    data() {
        return {
        };
    },
}
</script>