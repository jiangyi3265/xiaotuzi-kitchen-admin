<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 200px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['kitchen:wxUser:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['kitchen:wxUser:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="头像" align="center" width="90">
        <template #default="scope">
          <image-preview :src="scope.row.avatar" :width="40" :height="40" />
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center" prop="nickname" />
      <el-table-column label="用户编码" align="center" prop="userCode" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="性别" align="center" prop="gender" width="70">
        <template #default="scope">
          {{ scope.row.gender === '1' ? '男' : scope.row.gender === '2' ? '女' : '未知' }}
        </template>
      </el-table-column>
      <el-table-column label="积分" align="center" prop="carrot" width="80" />
      <el-table-column label="是否店主" align="center" prop="isOwner" width="90">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.isOwner" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">{{ scope.row.status === '0' ? '正常' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['kitchen:wxUser:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['kitchen:wxUser:remove']">删除</el-button>
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

    <!-- 修改用户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="wxUserRef" :model="form" label-width="80px">
        <el-form-item label="头像">
          <image-preview :src="form.avatar" :width="60" :height="60" />
        </el-form-item>
        <el-form-item label="用户编码">
          <el-input v-model="form.userCode" disabled />
        </el-form-item>
        <el-form-item label="性别">
          <el-input :value="form.gender === '1' ? '男' : form.gender === '2' ? '女' : '未知'" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number v-model="form.carrot" :min="0" />
        </el-form-item>
        <el-form-item label="是否店主">
          <el-select v-model="form.isOwner" placeholder="请选择">
            <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="WxUser">
import { listWxUser, getWxUser, delWxUser, updateWxUser } from "@/api/kitchen/wxUser"

const { proxy } = getCurrentInstance()
const { sys_yes_no } = proxy.useDict("sys_yes_no")

const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nickname: undefined,
    phone: undefined,
    status: undefined
  }
})

const { queryParams, form } = toRefs(data)

/** 查询小程序用户列表 */
function getList() {
  loading.value = true
  listWxUser(queryParams.value).then(response => {
    userList.value = response.rows
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

/** 取消按钮 */
function cancel() {
  open.value = false
}

/** 修改按钮操作 */
function handleUpdate(row) {
  getWxUser(row.id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改用户"
  })
}

/** 提交按钮 */
function submitForm() {
  updateWxUser(form.value).then(() => {
    proxy.$modal.msgSuccess("修改成功")
    open.value = false
    getList()
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids_ = row.id || ids.value
  proxy.$modal.confirm("是否确认删除该用户？").then(function () {
    return delWxUser(ids_)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/kitchen/wxUser/export", {
    ...queryParams.value
  }, `wxUser_${new Date().getTime()}.xlsx`)
}

getList()
</script>
