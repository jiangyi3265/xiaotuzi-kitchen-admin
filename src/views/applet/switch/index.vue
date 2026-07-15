<template>
  <div class="app-container">
    <el-alert
      title="修改后小程序需重新进入生效。"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 16px"
    />

    <el-card v-loading="loading">
      <template #header>
        <span>小程序功能开关</span>
      </template>

      <p class="tip-text">
        关闭后，小程序中「点餐/外卖」与「分享/社交」相关入口全部隐藏；取得对应资质后再开启。
      </p>

      <div class="switch-row">
        <el-switch
          v-model="enabled"
          :loading="saving"
          :disabled="saving || !config"
          active-text="已开启（功能显示）"
          inactive-text="已关闭（功能隐藏）"
          inline-prompt
          @change="handleChange"
        />
      </div>

      <el-alert
        v-if="!config && !loading"
        title="未找到配置项 wx.feature.enabled，可能后端 SQL 还未执行。请先在数据库初始化该配置后再操作。"
        type="warning"
        :closable="false"
        show-icon
        style="margin-top: 16px"
      />
    </el-card>
  </div>
</template>

<script setup name="AppletSwitch">
import { listConfig, updateConfig, refreshCache } from "@/api/system/config"

const CONFIG_KEY = "wx.feature.enabled"

const { proxy } = getCurrentInstance()

const loading = ref(true)
const saving = ref(false)
const enabled = ref(false)
// 存储该配置的完整对象（含 configId 等字段），更新时需要整对象提交
const config = ref(null)

/** 加载功能开关配置 */
function loadConfig() {
  loading.value = true
  listConfig({ configKey: CONFIG_KEY })
    .then(response => {
      const row = (response.rows || []).find(item => item.configKey === CONFIG_KEY)
      if (row) {
        config.value = row
        enabled.value = row.configValue === "true"
      } else {
        config.value = null
        enabled.value = false
        proxy.$modal.msgWarning("未找到配置项 " + CONFIG_KEY + "，可能后端 SQL 还未执行。")
      }
    })
    .catch(() => {
      config.value = null
      proxy.$modal.msgError("加载配置失败，请稍后重试。")
    })
    .finally(() => {
      loading.value = false
    })
}

/** 切换开关 */
function handleChange(val) {
  if (!config.value) {
    // 没有配置对象则回滚，避免误提交
    enabled.value = false
    proxy.$modal.msgWarning("配置项不存在，无法保存。")
    return
  }

  saving.value = true
  // 基于完整对象修改 configValue，保留 configId 等字段
  const payload = { ...config.value, configValue: val ? "true" : "false" }

  updateConfig(payload)
    .then(() => refreshCache())
    .then(() => {
      config.value = payload
      proxy.$modal.msgSuccess("已保存，小程序稍后生效")
    })
    .catch(() => {
      // 失败回滚开关状态
      enabled.value = !val
      proxy.$modal.msgError("保存失败，请稍后重试。")
    })
    .finally(() => {
      saving.value = false
    })
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.tip-text {
  color: #606266;
  line-height: 1.7;
  margin: 0 0 20px;
}
.switch-row {
  display: flex;
  align-items: center;
}
</style>
