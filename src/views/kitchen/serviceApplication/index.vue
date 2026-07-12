<template>
  <div class="app-container">
    <el-form :model="query" inline>
      <el-form-item label="申请身份">
        <el-select v-model="query.applicationType" clearable style="width: 150px">
          <el-option label="配送员" value="0" />
          <el-option label="代炒厨师" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请人"><el-input v-model="query.applicantName" clearable /></el-form-item>
      <el-form-item label="城市"><el-input v-model="query.city" clearable /></el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="query.auditStatus" clearable style="width: 130px">
          <el-option label="待审核" value="0" />
          <el-option label="已通过" value="1" />
          <el-option label="已驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="load">查询</el-button></el-form-item>
    </el-form>

    <el-alert title="审核通过后，系统会自动生成启用状态的配送员或代炒厨师资料，可继续到对应管理页面设置费用、头像和预计时间。" type="info" :closable="false" show-icon class="mb16" />

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="申请身份" width="105">
        <template #default="s"><el-tag :type="s.row.applicationType === '0' ? 'success' : 'warning'">{{ typeText(s.row.applicationType) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="申请人" prop="applicantName" width="100" />
      <el-table-column label="电话" prop="phone" width="130" />
      <el-table-column label="服务区域" min-width="190"><template #default="s">{{ s.row.province }} {{ s.row.city }} {{ s.row.district }}</template></el-table-column>
      <el-table-column label="详细地址" prop="address" min-width="160" show-overflow-tooltip />
      <el-table-column label="交通工具/擅长菜系" min-width="145"><template #default="s">{{ s.row.applicationType === '0' ? (s.row.vehicleType || '未填写') : (s.row.skillTag || '未填写') }}</template></el-table-column>
      <el-table-column label="经验说明" prop="experience" min-width="180" show-overflow-tooltip />
      <el-table-column label="审核状态" width="90"><template #default="s"><el-tag :type="statusType(s.row.auditStatus)">{{ statusText(s.row.auditStatus) }}</el-tag></template></el-table-column>
      <el-table-column label="人员ID" prop="providerId" width="85" />
      <el-table-column label="申请时间" prop="createTime" width="165" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="s">
          <el-button v-if="s.row.auditStatus === '0'" link type="success" @click="audit(s.row, '1')">通过</el-button>
          <el-button v-if="s.row.auditStatus === '0'" link type="danger" @click="audit(s.row, '2')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" />
  </div>
</template>

<script setup>
import { listServiceApplication, auditServiceApplication } from '@/api/kitchen/serviceApplication'

const { proxy } = getCurrentInstance()
const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10, applicationType: '', applicantName: '', city: '', auditStatus: '' })

function load() {
  loading.value = true
  listServiceApplication(query).then(r => {
    rows.value = r.rows || []
    total.value = r.total || 0
  }).finally(() => { loading.value = false })
}
function typeText(value) { return value === '0' ? '配送员' : '代炒厨师' }
function statusText(value) { return { '0': '待审核', '1': '已通过', '2': '已驳回' }[value] || '未知' }
function statusType(value) { return { '0': 'warning', '1': 'success', '2': 'danger' }[value] || 'info' }
function audit(row, auditStatus) {
  const action = auditStatus === '1' ? '通过' : '驳回'
  proxy.$modal.confirm(`确认${action}${row.applicantName}的${typeText(row.applicationType)}申请？`).then(() => {
    return auditServiceApplication({ id: row.id, auditStatus })
  }).then(() => {
    proxy.$modal.msgSuccess(`${action}成功`)
    load()
  })
}

load()
</script>
