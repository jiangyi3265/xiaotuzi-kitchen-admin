<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="厨师名称" prop="chefName">
        <el-input v-model="queryParams.chefName" placeholder="请输入厨师名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="擅长标签" prop="skillTag">
        <el-input v-model="queryParams.skillTag" placeholder="请输入擅长标签" clearable style="width: 200px" @keyup.enter="handleQuery" />
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['kitchen:chef:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['kitchen:chef:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['kitchen:chef:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['kitchen:chef:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="chefList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="头像" align="center" width="90">
        <template #default="scope">
          <image-preview :src="scope.row.avatar" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="厨师名称" align="center" prop="chefName" />
      <el-table-column label="擅长标签" align="center" prop="skillTag" />
      <el-table-column label="简介" align="center" prop="intro" :show-overflow-tooltip="true" />
      <el-table-column label="代炒加价" align="center" prop="extraPrice" width="90" />
      <el-table-column label="预计时长" align="center" prop="estTime" width="90" />
      <el-table-column label="状态" align="center" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">{{ scope.row.status === '0' ? '正常' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['kitchen:chef:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['kitchen:chef:remove']">删除</el-button>
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

    <!-- 添加或修改厨师对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="chefRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="头像" prop="avatar">
          <image-upload v-model="form.avatar" :limit="1" />
        </el-form-item>
        <el-form-item label="厨师名称" prop="chefName">
          <el-input v-model="form.chefName" placeholder="请输入厨师名称" />
        </el-form-item>
        <el-form-item label="擅长标签" prop="skillTag">
          <el-input v-model="form.skillTag" placeholder="如：红烧拿手" />
        </el-form-item>
        <el-form-item label="简介" prop="intro">
          <el-input v-model="form.intro" type="textarea" placeholder="擅长菜品介绍" />
        </el-form-item>
        <el-form-item label="代炒加价" prop="extraPrice">
          <el-input-number v-model="form.extraPrice" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="预计时长" prop="estTime">
          <el-input v-model="form.estTime" placeholder="如：约40分钟" />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
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

<script setup name="Chef">
import { listChef, getChef, delChef, addChef, updateChef } from "@/api/kitchen/chef"

const { proxy } = getCurrentInstance()

const chefList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    chefName: undefined,
    skillTag: undefined,
    status: undefined
  },
  rules: {
    chefName: [{ required: true, message: "厨师名称不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询厨师列表 */
function getList() {
  loading.value = true
  listChef(queryParams.value).then(response => {
    chefList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    chefName: undefined,
    avatar: undefined,
    skillTag: undefined,
    intro: undefined,
    extraPrice: 0,
    estTime: undefined,
    orderNum: 0,
    status: "0"
  }
  proxy.resetForm("chefRef")
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
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加厨师"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getChef(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改厨师"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["chefRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateChef(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addChef(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids_ = row.id || ids.value
  proxy.$modal.confirm('是否确认删除厨师编号为"' + ids_ + '"的数据项？').then(function () {
    return delChef(ids_)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/kitchen/chef/export", {
    ...queryParams.value
  }, `chef_${new Date().getTime()}.xlsx`)
}

getList()
</script>
