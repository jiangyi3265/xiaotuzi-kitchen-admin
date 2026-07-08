<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="菜品名称" prop="dishName">
        <el-input v-model="queryParams.dishName" placeholder="请输入菜品名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-tree-select
          v-model="queryParams.categoryId"
          :data="categoryOptions"
          :props="{ value: 'id', label: 'catName', children: 'children' }"
          value-key="id"
          placeholder="选择分类"
          check-strictly
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜品状态" clearable style="width: 200px">
          <el-option v-for="dict in kitchen_dish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['kitchen:dish:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['kitchen:dish:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['kitchen:dish:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['kitchen:dish:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dishList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="封面" align="center" width="90">
        <template #default="scope">
          <image-preview :src="scope.row.cover" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="菜品名称" align="left" prop="dishName" />
      <el-table-column label="分类" align="center" prop="categoryName" />
      <el-table-column label="虚拟金额" align="center" prop="virtualPrice" width="90" />
      <el-table-column label="销量" align="center" prop="sales" width="80" />
      <el-table-column label="难度" align="center" prop="difficulty" width="80">
        <template #default="scope">
          <dict-tag :options="kitchen_difficulty" :value="scope.row.difficulty" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <dict-tag :options="kitchen_dish_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['kitchen:dish:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['kitchen:dish:remove']">删除</el-button>
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

    <!-- 添加或修改菜品对话框 -->
    <el-dialog :title="title" v-model="open" width="780px" append-to-body>
      <el-form ref="dishRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="封面图" prop="cover">
              <image-upload v-model="form.cover" :limit="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜品名称" prop="dishName">
              <el-input v-model="form.dishName" placeholder="请输入菜品名称" />
            </el-form-item>
            <el-form-item label="所属分类" prop="categoryId">
              <el-tree-select
                v-model="form.categoryId"
                :data="categoryOptions"
                :props="{ value: 'id', label: 'catName', children: 'children' }"
                value-key="id"
                placeholder="选择分类"
                check-strictly
              />
            </el-form-item>
            <el-form-item label="是否上架" prop="status">
              <el-switch v-model="form.status" active-value="1" inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="菜品描述" prop="story">
          <el-input v-model="form.story" type="textarea" :rows="2" placeholder="菜品背后的故事" />
        </el-form-item>
        <el-form-item label="所用用料" prop="ingredients">
          <el-input v-model="form.ingredients" type="textarea" :rows="3" placeholder="每行一项，例如：鸡腿 2只、洋葱 1个、生抽 2勺" />
        </el-form-item>
        <el-row>
          <el-col :span="8">
            <el-form-item label="虚拟金额" prop="virtualPrice">
              <el-input-number v-model="form.virtualPrice" :precision="2" :min="0" placeholder="不填不显示" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="难度">
                <el-option v-for="dict in kitchen_difficulty" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="适合人数" prop="portions">
              <el-input-number v-model="form.portions" :min="1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="准备时间(分)" prop="prepTime">
              <el-input-number v-model="form.prepTime" :min="0" :step="5" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="烹饪时间(分)" prop="cookTime">
              <el-input-number v-model="form.cookTime" :min="0" :step="5" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="做法公开" prop="recipeOpen">
              <el-switch v-model="form.recipeOpen" active-value="1" inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="烹饪经验" prop="cookingExp">
          <el-input v-model="form.cookingExp" type="textarea" :rows="2" placeholder="火候/选材心得" />
        </el-form-item>

        <!-- 多规格 -->
        <el-divider content-position="left">
          多规格
          <el-switch v-model="form.hasSpecs" active-value="1" inactive-value="0" style="margin-left: 10px" />
        </el-divider>
        <div v-if="form.hasSpecs === '1'">
          <div v-for="(spec, si) in form.specs" :key="si" style="border: 1px dashed #ddd; padding: 10px; margin-bottom: 10px; border-radius: 6px">
            <el-row :gutter="10">
              <el-col :span="8"><el-input v-model="spec.specName" placeholder="规格名(如辣度)" /></el-col>
              <el-col :span="8">
                <el-radio-group v-model="spec.multiple">
                  <el-radio value="0">单选</el-radio>
                  <el-radio value="1">多选</el-radio>
                </el-radio-group>
              </el-col>
              <el-col :span="8" style="text-align: right">
                <el-button size="small" type="danger" icon="Delete" @click="removeSpec(si)">删除规格</el-button>
              </el-col>
            </el-row>
            <div style="margin-top: 8px">
              <el-tag v-for="(v, vi) in spec.values" :key="vi" closable @close="spec.values.splice(vi, 1)" style="margin-right: 6px">
                {{ v.specValue }}
              </el-tag>
              <el-input
                v-if="spec.inputVisible"
                v-model="spec.inputValue"
                size="small"
                style="width: 120px"
                @keyup.enter="addSpecValue(spec)"
                @blur="addSpecValue(spec)"
              />
              <el-button v-else size="small" @click="spec.inputVisible = true">+ 添加选择值</el-button>
            </div>
          </div>
          <el-button type="primary" plain size="small" icon="Plus" @click="addSpec">添加规格分类</el-button>
        </div>

        <!-- 做法步骤 -->
        <el-divider content-position="left">做法步骤</el-divider>
        <div v-for="(step, idx) in form.steps" :key="idx" style="border: 1px dashed #ddd; padding: 10px; margin-bottom: 10px; border-radius: 6px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
            <span style="font-weight: bold">步骤 {{ idx + 1 }}</span>
            <el-button size="small" type="danger" icon="Delete" @click="form.steps.splice(idx, 1)">删除</el-button>
          </div>
          <el-row :gutter="10">
            <el-col :span="6"><image-upload v-model="step.image" :limit="1" /></el-col>
            <el-col :span="14"><el-input v-model="step.content" type="textarea" :rows="3" placeholder="步骤说明" /></el-col>
            <el-col :span="4">
              <el-input-number v-model="step.timer" :min="0" :step="30" controls-position="right" />
              <div style="font-size: 12px; color: #999">定时(秒)</div>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" plain size="small" icon="Plus" @click="addStep">再增加一步</el-button>
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

<script setup name="Dish">
import { listDish, getDish, delDish, addDish, updateDish } from "@/api/kitchen/dish"
import { treeCategory } from "@/api/kitchen/category"

const { proxy } = getCurrentInstance()
const { kitchen_dish_status, kitchen_difficulty } = proxy.useDict("kitchen_dish_status", "kitchen_difficulty")

const dishList = ref([])
const categoryOptions = ref([])
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
    dishName: undefined,
    categoryId: undefined,
    status: undefined
  },
  rules: {
    dishName: [{ required: true, message: "菜品名称不能为空", trigger: "blur" }],
    categoryId: [{ required: true, message: "请选择所属分类", trigger: "change" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询菜品列表 */
function getList() {
  loading.value = true
  listDish(queryParams.value).then(response => {
    dishList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 查询分类下拉树结构 */
function getTreeselect() {
  treeCategory().then(response => {
    categoryOptions.value = response.data
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
    dishName: undefined,
    cover: undefined,
    categoryId: undefined,
    story: undefined,
    ingredients: undefined,
    virtualPrice: undefined,
    hasSpecs: "0",
    recipeOpen: "1",
    cookingExp: undefined,
    prepTime: 15,
    cookTime: 20,
    difficulty: "中等",
    portions: 2,
    orderNum: 0,
    status: "1",
    specs: [],
    steps: []
  }
  proxy.resetForm("dishRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.categoryId = undefined
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
  title.value = "添加菜品"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getDish(id).then(response => {
    form.value = response.data
    if (!form.value.specs) form.value.specs = []
    if (!form.value.steps) form.value.steps = []
    open.value = true
    title.value = "修改菜品"
  })
}

/** 添加规格分类 */
function addSpec() {
  form.value.specs.push({ specName: "", multiple: "0", values: [], inputVisible: false, inputValue: "" })
}

/** 删除规格分类 */
function removeSpec(i) {
  form.value.specs.splice(i, 1)
}

/** 添加规格选择值 */
function addSpecValue(spec) {
  const val = (spec.inputValue || "").trim()
  if (val && !spec.values.some(v => v.specValue === val)) {
    spec.values.push({ specValue: val })
  }
  spec.inputVisible = false
  spec.inputValue = ""
}

/** 添加做法步骤 */
function addStep() {
  form.value.steps.push({ image: "", content: "", timer: 0 })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["dishRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateDish(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDish(form.value).then(() => {
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
  proxy.$modal.confirm('是否确认删除菜品编号为"' + ids_ + '"的数据项？').then(function () {
    return delDish(ids_)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/kitchen/dish/export", {
    ...queryParams.value
  }, `dish_${new Date().getTime()}.xlsx`)
}

getList()
getTreeselect()
</script>
