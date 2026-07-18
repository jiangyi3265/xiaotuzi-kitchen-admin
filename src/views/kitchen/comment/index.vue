<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="内容" prop="content">
        <el-input v-model="queryParams.content" placeholder="请输入评论内容" clearable style="width: 200px" @keyup.enter="handleQuery" />
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
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['kitchen:comment:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="评论人" align="center" prop="userNickname" />
      <el-table-column label="内容" align="center" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="成品ID" align="center" prop="postId" width="90" />
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="90">
        <template #default="scope">
          <dict-tag :options="kitchen_audit_status" :value="scope.row.auditStatus" />
        </template>
      </el-table-column>
      <el-table-column label="评论时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="success" icon="CircleCheck" @click="doAudit(scope.row, '1')" v-hasPermi="['kitchen:comment:edit']">通过</el-button>
          <el-button link type="danger" icon="CircleClose" @click="doAudit(scope.row, '2')" v-hasPermi="['kitchen:comment:edit']">驳回</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['kitchen:comment:remove']">删除</el-button>
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

<script setup name="Comment">
import { listComment, delComment, auditComment } from "@/api/kitchen/comment"

const { proxy } = getCurrentInstance()
const { kitchen_audit_status } = proxy.useDict("kitchen_audit_status")

const commentList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    content: undefined,
    auditStatus: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询评论列表 */
function getList() {
  loading.value = true
  listComment(queryParams.value).then(response => {
    commentList.value = response.rows
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
  auditComment({ id: row.id, auditStatus: status }).then(() => {
    proxy.$modal.msgSuccess(status === "1" ? "已通过" : "已驳回")
    getList()
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids_ = row.id || ids.value
  proxy.$modal.confirm("是否确认删除该评论？").then(function () {
    return delComment(ids_)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>
