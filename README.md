
###### 模式

=== 为form添加定制的validation rule：
现有实现：
a. 从元数据推导rules，目前仅实现了required，需要实现更多的通用的验证，使用detail_form.rules存储所有规则
b. detail_form增加了customRules输入参数，增加定制的rule ，参见patient.vue

=== trim处理
在onSave中 执行validate()方法前，先对entity的值进行trim处理
this.patient = trimProcess(this.patient);
