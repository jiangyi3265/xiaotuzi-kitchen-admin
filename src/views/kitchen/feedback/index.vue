<template>
  <div class="app-container">
    <el-form :model="query" inline>
      <el-form-item label="反馈类型"><el-select v-model="query.feedbackType" clearable style="width: 140px"><el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item label="处理状态"><el-select v-model="query.handleStatus" clearable style="width: 130px"><el-option label="待处理" value="0" /><el-option label="处理中" value="1" /><el-option label="已回复" value="2" /></el-select></el-form-item>
      <el-form-item label="内容"><el-input v-model="query.content" clearable placeholder="搜索反馈内容" /></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="load">查询</el-button></el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows">
      <el-table-column label="用户" prop="userNickname" width="110" />
      <el-table-column label="类型" width="100"><template #default="s"><el-tag>{{ typeText(s.row.feedbackType) }}</el-tag></template></el-table-column>
      <el-table-column label="反馈内容" prop="content" min-width="260" show-overflow-tooltip />
      <el-table-column label="图片" width="110"><template #default="s"><div class="image-list"><el-image v-for="url in imageList(s.row.images)" :key="url" :src="url" :preview-src-list="imageList(s.row.images)" preview-teleported fit="cover" /></div></template></el-table-column>
      <el-table-column label="联系方式" prop="contact" width="150" />
      <el-table-column label="状态" width="90"><template #default="s"><el-tag :type="statusType(s.row.handleStatus)">{{ statusText(s.row.handleStatus) }}</el-tag></template></el-table-column>
      <el-table-column label="回复" prop="reply" min-width="180" show-overflow-tooltip />
      <el-table-column label="提交时间" prop="createTime" width="165" />
      <el-table-column label="操作" width="95" fixed="right"><template #default="s"><el-button link type="primary" @click="openHandle(s.row)">处理</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" />

    <el-dialog v-model="dialogVisible" title="处理反馈" width="520px">
      <el-form label-width="82px">
        <el-form-item label="反馈内容"><div class="feedback-content">{{ current.content }}</div></el-form-item>
        <el-form-item label="处理状态"><el-radio-group v-model="current.handleStatus"><el-radio value="1">处理中</el-radio><el-radio value="2">已回复</el-radio></el-radio-group></el-form-item>
        <el-form-item label="回复用户"><el-input v-model="current.reply" type="textarea" :rows="5" maxlength="800" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="save">保存并同步</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listFeedback, handleFeedback } from '@/api/kitchen/feedback'
const { proxy } = getCurrentInstance()
const types = [{ value: '0', label: '功能建议' }, { value: '1', label: '问题反馈' }, { value: '2', label: '服务投诉' }, { value: '3', label: '其他' }]
const query = reactive({ pageNum: 1, pageSize: 10, feedbackType: '', handleStatus: '', content: '' })
const loading = ref(false), rows = ref([]), total = ref(0), dialogVisible = ref(false), current = ref({})
function load(){loading.value=true;listFeedback(query).then(r=>{rows.value=r.rows||[];total.value=r.total||0}).finally(()=>loading.value=false)}
function typeText(v){return (types.find(x=>x.value===v)||{}).label||'其他'}
function statusText(v){return {'0':'待处理','1':'处理中','2':'已回复'}[v]||'未知'}
function statusType(v){return {'0':'warning','1':'primary','2':'success'}[v]||'info'}
function imageList(value){const base=import.meta.env.VITE_APP_BASE_API||'';return String(value||'').split(',').map(x=>x.trim()).filter(Boolean).map(x=>/^https?:\/\//i.test(x)?x:base+x)}
function openHandle(row){current.value={id:row.id,content:row.content,handleStatus:row.handleStatus==='0'?'1':row.handleStatus,reply:row.reply||''};dialogVisible.value=true}
function save(){if(current.value.handleStatus==='2'&&!current.value.reply.trim()){proxy.$modal.msgWarning('请填写回复内容');return}handleFeedback(current.value).then(()=>{proxy.$modal.msgSuccess('处理结果已同步');dialogVisible.value=false;load()})}
load()
</script>

<style scoped>
.image-list{display:flex;gap:6px}.image-list .el-image{width:34px;height:34px;border-radius:5px}.feedback-content{padding:10px 12px;border-radius:6px;background:#f4f7f6;line-height:1.6;white-space:pre-wrap}
</style>
