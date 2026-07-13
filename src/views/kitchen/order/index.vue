<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="收货电话" prop="receiverPhone">
        <el-input v-model="queryParams.receiverPhone" placeholder="收货电话" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="服务方式" prop="serviceType">
        <el-select v-model="queryParams.serviceType" placeholder="服务方式" clearable style="width: 200px">
          <el-option v-for="dict in kitchen_service_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="订单状态" clearable style="width: 200px">
          <el-option v-for="dict in kitchen_order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['kitchen:order:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['kitchen:order:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="orderNo" width="160" />
      <el-table-column label="下单用户" align="center" prop="userNickname" />
      <el-table-column label="订单来源" align="center" width="120"><template #default="scope"><el-tag v-if="scope.row.groupRoomId" type="success">多人聚餐</el-tag><el-tag v-else-if="scope.row.coupleSpaceId" type="danger">情侣空间</el-tag><span v-else>普通订单</span></template></el-table-column>
      <el-table-column label="服务方式" align="center" prop="serviceType">
        <template #default="scope">
          <div class="service-tags">
            <dict-tag :options="kitchen_service_type" :value="scope.row.serviceType" />
            <el-tag v-if="isStockOrder(scope.row)" type="warning" size="small">备货清单</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="厨师" align="center" prop="chefName" />
      <el-table-column label="件数" align="center" prop="totalCount" width="70" />
      <el-table-column label="金额" align="center" prop="totalAmount" width="90" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="kitchen_order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="支付" align="center" prop="payStatus" width="80">
        <template #default="scope">
          <dict-tag :options="kitchen_pay_status" :value="scope.row.payStatus" />
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-if="isStockOrder(scope.row)" link type="warning" icon="DocumentCopy" @click="handleCopyStock(scope.row)" v-hasPermi="['kitchen:order:query']">复制清单</el-button>
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['kitchen:order:query']">详情</el-button>
          <el-button link type="primary" icon="Promotion" @click="handleStatus(scope.row)" v-hasPermi="['kitchen:order:edit']">改状态</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['kitchen:order:remove']">删除</el-button>
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

    <!-- 订单详情 -->
    <el-dialog title="订单详情" v-model="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="下单用户">{{ detail.userNickname }}</el-descriptions-item>
        <el-descriptions-item label="订单来源">{{ detail.groupRoomId ? `多人聚餐 #${detail.groupRoomId}` : detail.coupleSpaceId ? `情侣空间 #${detail.coupleSpaceId}` : '普通订单' }}</el-descriptions-item>
        <el-descriptions-item label="服务方式">
          <dict-tag :options="kitchen_service_type" :value="detail.serviceType" />
        </el-descriptions-item>
        <el-descriptions-item label="厨师">{{ detail.chefName }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detail.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ detail.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detail.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="isStockOrder(detail)" class="stock-copy-panel">
        <div>
          <strong>商家提前备货清单</strong>
          <span>复制后可直接粘贴到微信发送</span>
        </div>
        <el-button type="primary" icon="DocumentCopy" @click="copyStockList(detail)">一键复制备货清单</el-button>
      </div>
      <el-table :data="detail.items" style="margin-top: 15px">
        <el-table-column label="菜品" prop="dishName" />
        <el-table-column label="规格" prop="specJson" />
        <el-table-column label="数量" prop="quantity" width="80" />
        <el-table-column label="单价" prop="price" width="100" />
      </el-table>
      <div style="text-align: right; margin-top: 10px; font-weight: bold">合计：￥{{ detail.totalAmount }}（{{ detail.totalCount }} 件）</div>
    </el-dialog>

    <!-- 改状态 -->
    <el-dialog title="修改订单状态" v-model="statusOpen" width="400px" append-to-body>
      <el-form label-width="90px">
        <el-form-item label="订单状态">
          <el-select v-model="statusForm.orderStatus" placeholder="选择状态">
            <el-option v-for="dict in kitchen_order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitStatus">确 定</el-button>
          <el-button @click="statusOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, delOrder, changeOrderStatus } from "@/api/kitchen/order"

const { proxy } = getCurrentInstance()
const { kitchen_service_type, kitchen_order_status, kitchen_pay_status } = proxy.useDict("kitchen_service_type", "kitchen_order_status", "kitchen_pay_status")

const orderList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const detailOpen = ref(false)
const detail = ref({ items: [] })
const statusOpen = ref(false)
const statusForm = ref({ id: undefined, orderStatus: undefined })

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    receiverPhone: undefined,
    serviceType: undefined,
    orderStatus: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询订单列表 */
function getList() {
  loading.value = true
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows
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

/** 详情按钮操作 */
function handleDetail(row) {
  getOrder(row.id).then(response => {
    detail.value = response.data
    detailOpen.value = true
  })
}

function isStockOrder(order) {
  return String(order?.remark || '').includes('商家提前备货群')
}

function buildStockList(order) {
  const items = Array.isArray(order?.items) ? order.items : []
  const lines = ['【商家提前备货清单】']
  if (order?.orderNo) lines.push(`订单号：${order.orderNo}`)
  if (order?.userNickname) lines.push(`下单用户：${order.userNickname}`)
  lines.push('', '菜品清单：')
  items.forEach((item, index) => lines.push(`${index + 1}. ${item.dishName || '菜品'} × ${item.quantity || 1}`))
  lines.push('', `合计：${items.length} 种菜，共 ${order?.totalCount || 0} 份`)
  const note = String(order?.remark || '')
    .split('\n')
    .filter(line => line && !line.startsWith('用餐类型：') && !line.startsWith('菜市场方式：'))
    .join('；')
  if (note) lines.push(`备注：${note}`)
  lines.push('请确认库存和备货时间，谢谢。')
  return lines.join('\n')
}

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

async function copyStockList(order) {
  await writeClipboard(buildStockList(order))
  proxy.$modal.msgSuccess('备货清单已复制，可粘贴到微信发送')
}

async function handleCopyStock(row) {
  const response = await getOrder(row.id)
  await copyStockList(response.data)
}

/** 改状态按钮操作 */
function handleStatus(row) {
  statusForm.value = { id: row.id, orderStatus: row.orderStatus }
  statusOpen.value = true
}

/** 提交订单状态 */
function submitStatus() {
  changeOrderStatus(statusForm.value).then(() => {
    proxy.$modal.msgSuccess("状态已更新")
    statusOpen.value = false
    getList()
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids_ = row.id || ids.value
  proxy.$modal.confirm('是否确认删除订单编号为"' + ids_ + '"的数据项？').then(function () {
    return delOrder(ids_)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/kitchen/order/export", {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped>
.service-tags { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
.stock-copy-panel { margin-top: 16px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 18px; border: 1px solid #dcebe6; border-radius: 8px; background: #f3faf7; }
.stock-copy-panel > div { display: flex; flex-direction: column; gap: 5px; }
.stock-copy-panel strong { color: #26332f; font-size: 15px; }
.stock-copy-panel span { color: #73817c; font-size: 13px; }
</style>
