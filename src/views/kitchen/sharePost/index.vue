<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="queryParams.auditStatus" placeholder="审核状态" clearable style="width: 200px">
          <el-option v-for="dict in kitchen_audit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['kitchen:sharePost:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['kitchen:sharePost:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="发布用户" align="center" prop="userNickname" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="正文" align="center" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="图片" align="center" width="120">
        <template #default="scope">
          <image-preview v-if="scope.row.images" :src="scope.row.images.split(',')[0]" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="点赞" align="center" prop="likeCount" width="70" />
      <el-table-column label="评论" align="center" prop="commentCount" width="70" />
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="90">
        <template #default="scope">
          <dict-tag :options="kitchen_audit_status" :value="scope.row.auditStatus" />
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="success" icon="CircleCheck" @click="doAudit(scope.row, '1')" v-hasPermi="['kitchen:sharePost:audit']">通过</el-button>
          <el-button link type="danger" icon="CircleClose" @click="doAudit(scope.row, '2')" v-hasPermi="['kitchen:sharePost:audit']">驳回</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['kitchen:sharePost:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="SharePost">
import { listSharePost, delSharePost, auditSharePost } from "@/api/kitchen/sharePost"

const { proxy } = getCurrentInstance()
const { kitchen_audit_status } = proxy.useDict("kitchen_audit_status")

const postList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    auditStatus: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询分享动态列表 */
function getList() {
  loading.value = true
  listSharePost(queryParams.value).then(response => {
    postList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

/** 审核操作 */
function doAudit(row, status) {
  auditSharePost({ id: row.id, auditStatus: status }).then(() => {
    proxy.$modal.msgSuccess(status === "1" ? "已通过" : "已驳回")
    getList()
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids_ = row.id || ids.value
  proxy.$modal.confirm("是否确认删除该动态？").then(function () {
    return delSharePost(ids_)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/kitchen/sharePost/export", {
    ...queryParams.value
  }, `sharePost_${new Date().getTime()}.xlsx`)
}

getList()
</script>
