<template>
  <div class="app-container">
    <el-form :model="query" inline>
      <el-form-item label="申请人"><el-input v-model="query.applicantName" clearable /></el-form-item>
      <el-form-item label="城市"><el-input v-model="query.city" clearable /></el-form-item>
      <el-form-item label="区县"><el-input v-model="query.district" clearable /></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="load">查询</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="rows">
      <el-table-column label="申请人" prop="applicantName" width="100" />
      <el-table-column label="电话" prop="phone" width="130" />
      <el-table-column label="申请区域" min-width="210"><template #default="s">{{ s.row.province }} {{ s.row.city }} {{ s.row.district }}</template></el-table-column>
      <el-table-column label="详细地址" prop="address" min-width="180" show-overflow-tooltip />
      <el-table-column label="申请说明" prop="experience" min-width="180" show-overflow-tooltip />
      <el-table-column label="审核状态" width="90"><template #default="s"><el-tag :type="statusType(s.row.auditStatus)">{{ statusText(s.row.auditStatus) }}</el-tag></template></el-table-column>
      <el-table-column label="区域服务" width="110"><template #default="s"><el-switch v-model="s.row.enabled" active-value="1" inactive-value="0" :disabled="s.row.auditStatus !== '1'" @change="toggle(s.row)" /></template></el-table-column>
      <el-table-column label="申请时间" prop="createTime" width="165" />
      <el-table-column label="操作" width="150" fixed="right"><template #default="s">
        <el-button v-if="s.row.auditStatus==='0'" link type="success" @click="audit(s.row,'1')">通过</el-button>
        <el-button v-if="s.row.auditStatus==='0'" link type="danger" @click="audit(s.row,'2')">驳回</el-button>
      </template></el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" />
  </div>
</template>
<script setup>
import { listRegionApplication, auditRegionApplication, setRegionEnabled } from '@/api/kitchen/regionApplication'
const { proxy } = getCurrentInstance()
const loading=ref(false), rows=ref([]), total=ref(0)
const query=reactive({pageNum:1,pageSize:10,applicantName:'',city:'',district:''})
function load(){loading.value=true;listRegionApplication(query).then(r=>{rows.value=r.rows||[];total.value=r.total||0}).finally(()=>loading.value=false)}
function statusText(v){return {'0':'待审核','1':'已通过','2':'已驳回'}[v]||'未知'}
function statusType(v){return {'0':'warning','1':'success','2':'danger'}[v]||'info'}
function audit(row,status){const action=status==='1'?'通过':'驳回';proxy.$modal.confirm(`确认${action}该区域代理申请？`).then(()=>auditRegionApplication({id:row.id,auditStatus:status})).then(()=>{proxy.$modal.msgSuccess(`${action}成功`);load()})}
function toggle(row){setRegionEnabled({id:row.id,enabled:row.enabled}).then(()=>proxy.$modal.msgSuccess(row.enabled==='1'?'区域服务已开通':'区域服务已关闭')).catch(()=>{row.enabled=row.enabled==='1'?'0':'1'})}
load()
</script>
