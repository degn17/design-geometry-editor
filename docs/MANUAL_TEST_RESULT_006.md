# MANUAL_TEST_RESULT_006

## Vector Warp Test

1. 上传汽车侧视图
结果：ok

2. 添加一个控制点，例如车尾点
结果：ok

3. 普通拖动 Point 是否仍然移动点本身
结果：ok

4. 按住 Command / Ctrl 拖动 Point 是否生成 displacement vector
结果：是会生成displacement vecotr，但是按住command拖动 vector时，目标点有时会有坐标跳动的问题。

5. 画面是否显示箭头和 influence radius
结果：正常显示

6. RightPanel 是否显示 dx / dy / targetX / targetY / influenceRadius
结果：ok

7. 点击 Apply Vector Warp
结果：可以使用

8. 图像是否根据控制点位移发生局部变形
结果：是的

9. Original / Transformed 切换是否正常
结果：是的

10. Before / After slider 是否正常
结果：是的

11. Export PNG 是否正常
结果：是的

12. 现有 Region-based stretch 是否仍然正常
结果：正常

13. 没有 displacement 时点击 Apply Vector Warp 是否有合理提示
结果：displacement点无法删除，所以无法测试。

14. 变形质量问题记录
结果：暂时没问题
