MANUAL_TEST_RESULT_002

1. 上传汽车侧视图 ok

2. 添加前轮心、后轮心、车头点、车尾点  ok
3. 创建轴线 ok
4. 创建影响区域 ok
5. 锁定两个轮子 ok
6. 调整 Region / Lock 大小 ok
7. 输入 changePercent = 8 ok
8. Apply Transform .ok
9. Original / Transformed 对比. ok
10. 导出 PNG 。 Ok
11. 删除一个点，观察相关轴线是否也被清掉。 没问题
12. 故意不选 Region 就 Apply，看是否有错误提示 
目前是选择了轴之后才会有 applied 的图标，然后如果没有存在region 的话，apply transform 是无法点击的。