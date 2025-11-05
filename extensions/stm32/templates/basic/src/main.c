/**
 * STM32F429 基础项目模板
 * ZSide4CD IDE
 */

#include "stm32f4xx.h"

// LED引脚定义 (假设使用PG13 - STM32F429 Discovery板上的绿色LED)
#define LED_PIN                 GPIO_PIN_13
#define LED_GPIO_PORT           GPIOG
#define LED_GPIO_CLK_ENABLE()   __HAL_RCC_GPIOG_CLK_ENABLE()

/**
 * 系统时钟配置
 * 配置系统时钟为180MHz
 */
void SystemClock_Config(void)
{
    // 这里应该包含完整的时钟配置代码
    // 简化版本，实际应用中需要详细配置
}

/**
 * GPIO初始化
 */
void GPIO_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    
    // 使能GPIO时钟
    LED_GPIO_CLK_ENABLE();
    
    // 配置GPIO引脚
    GPIO_InitStruct.Pin = LED_PIN;
    GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
    HAL_GPIO_Init(LED_GPIO_PORT, &GPIO_InitStruct);
}

/**
 * 延时函数（简单实现）
 */
void Delay(uint32_t time)
{
    volatile uint32_t i;
    for(i = 0; i < time * 1000; i++);
}

/**
 * 主函数
 */
int main(void)
{
    // 初始化HAL库
    HAL_Init();
    
    // 配置系统时钟
    SystemClock_Config();
    
    // 初始化GPIO
    GPIO_Init();
    
    // 主循环
    while(1)
    {
        // LED闪烁
        HAL_GPIO_TogglePin(LED_GPIO_PORT, LED_PIN);
        Delay(500); // 延时500ms
    }
}

/**
 * 系统滴答定时器回调
 */
void SysTick_Handler(void)
{
    HAL_IncTick();
}
