MANUAL_TEST_RESULT_002

1. 上传汽车侧视图 OK
2. 添加前轮心、后轮心、车头点、车尾点 OK
3. 创建轴线 OK
4. 创建影响区域 OK
5. 锁定两个轮子 OK
6. 调整 Region / Lock 大小 OK
7. 输入 changePercent = 8 OK
8. Apply Transform OK
9. Original / Transformed 对比 OK
10. 导出 PNG OK
11. 删除一个点，观察相关轴线是否也被清掉：没问题
12. 故意不选 Region 就 Apply，看是否有错误提示：目前是选择了 Axis 后才会有 Apply Transform；如果没有 Region，Apply Transform 无法点击，基础校验有效
