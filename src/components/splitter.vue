<template>
    <div class="divider" @mousedown="onMouseDown"></div>
</template>
<script>
export default {
    data() {
        return {
            dragging: false
        };
    },
    methods: {
        onMouseDown() {
            this.dragging = true;
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        },
        onMouseMove(event) {
            if (this.dragging) {
                const containerLeft = this.$parent.$el.getBoundingClientRect().left;
                let newWidth = event.clientX - containerLeft;
                newWidth = Math.max(newWidth, 100);
                this.$emit('resize', newWidth);
            }
        },
        onMouseUp() {
            this.dragging = false;
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
    }
};
</script>
<style scoped>
.divider {
    width: 2px;
    cursor: ew-resize;
    /* 指针显示为水平拖动的形状 */
    background-color: #dcdcdc;
    height: 100%;
}
</style>