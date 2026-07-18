<template>
  <div class="app-container">
    <el-tabs v-model="tab">
      <el-tab-pane label="多人聚餐" name="group">
        <el-table v-loading="groupLoading" :data="groups">
          <el-table-column label="房间码" prop="roomCode" width="110" />
          <el-table-column label="房间名称" prop="title" min-width="180" />
          <el-table-column label="发起人" prop="ownerName" />
          <el-table-column label="成员" prop="memberCount" width="80" />
          <el-table-column label="菜单金额" width="110">
            <template #default="scope">￥{{ scope.row.total || 0 }}</template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" width="165" />
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag :type="groupStatusMeta(scope.row.status).type">
                {{ groupStatusMeta(scope.row.status).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="130">
            <template #default="scope">
              <el-button
                v-if="String(scope.row.status) === '1'"
                link
                type="danger"
                icon="CircleClose"
                :loading="closingGroupId === scope.row.id"
                @click="closeGroup(scope.row)"
                v-hasPermi="['kitchen:social:edit']"
              >关闭房间</el-button>
              <span v-else class="terminal-state">终态只读</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="groupTotal > 0"
          :total="groupTotal"
          v-model:page="groupQuery.pageNum"
          v-model:limit="groupQuery.pageSize"
          @pagination="loadGroups"
        />
      </el-tab-pane>

      <el-tab-pane label="情侣空间" name="couple">
        <el-table v-loading="coupleLoading" :data="couples">
          <el-table-column label="邀请码" prop="inviteCode" width="110" />
          <el-table-column label="用户A" prop="userAName" />
          <el-table-column label="用户B" prop="userBName" />
          <el-table-column label="相恋日期" prop="startDate" width="120" />
          <el-table-column label="投喂次数" prop="feedCount" width="100" />
          <el-table-column label="创建时间" prop="createTime" width="165" />
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag :type="coupleStatusMeta(scope.row.status).type">
                {{ coupleStatusMeta(scope.row.status).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="130">
            <template #default="scope">
              <el-button
                v-if="String(scope.row.status) === '1'"
                link
                type="danger"
                icon="CircleClose"
                :loading="closingCoupleId === scope.row.id"
                @click="closeCouple(scope.row)"
                v-hasPermi="['kitchen:social:edit']"
              >关闭空间</el-button>
              <span v-else class="terminal-state">终态只读</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="coupleTotal > 0"
          :total="coupleTotal"
          v-model:page="coupleQuery.pageNum"
          v-model:limit="coupleQuery.pageSize"
          @pagination="loadCouples"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="SocialSpace">
import { listGroupRooms, listCoupleSpaces, updateGroupStatus, updateCoupleStatus } from '@/api/kitchen/social'

const { proxy } = getCurrentInstance()
const tab = ref('group')
const groupLoading = ref(false)
const coupleLoading = ref(false)
const closingGroupId = ref()
const closingCoupleId = ref()
const groups = ref([])
const couples = ref([])
const groupTotal = ref(0)
const coupleTotal = ref(0)
const groupQuery = reactive({ pageNum: 1, pageSize: 10 })
const coupleQuery = reactive({ pageNum: 1, pageSize: 10 })

function loadGroups() {
  groupLoading.value = true
  return listGroupRooms(groupQuery).then(response => {
    groups.value = response.rows || []
    groupTotal.value = response.total || 0
  }).finally(() => { groupLoading.value = false })
}

function loadCouples() {
  coupleLoading.value = true
  return listCoupleSpaces(coupleQuery).then(response => {
    couples.value = response.rows || []
    coupleTotal.value = response.total || 0
  }).finally(() => { coupleLoading.value = false })
}

function groupStatusMeta(status) {
  if (String(status) === '1') return { label: '进行中', type: 'success' }
  if (String(status) === '2') return { label: '已结束', type: 'info' }
  if (String(status) === '0') return { label: '已关闭', type: 'danger' }
  return { label: '未知', type: 'info' }
}

function coupleStatusMeta(status) {
  return String(status) === '1'
    ? { label: '活动中', type: 'success' }
    : { label: '已解除', type: 'info' }
}

function closeGroup(row) {
  const id = row.id
  proxy.$modal.confirm(`确认关闭聚餐房间“${row.title || row.roomCode}”吗？关闭后不能恢复，成员将无法继续使用。`).then(() => {
    closingGroupId.value = id
    return updateGroupStatus({ id, status: '0' })
  }).then(() => {
    proxy.$modal.msgSuccess('聚餐房间已关闭')
    return loadGroups()
  }).catch(() => {
    if (closingGroupId.value === id) return loadGroups()
  }).finally(() => {
    if (closingGroupId.value === id) closingGroupId.value = undefined
  })
}

function closeCouple(row) {
  const id = row.id
  proxy.$modal.confirm(`确认关闭情侣空间“${row.inviteCode}”吗？关闭后不能恢复，双方将无法继续使用。`).then(() => {
    closingCoupleId.value = id
    return updateCoupleStatus({ id, status: '0' })
  }).then(() => {
    proxy.$modal.msgSuccess('情侣空间已关闭')
    return loadCouples()
  }).catch(() => {
    if (closingCoupleId.value === id) return loadCouples()
  }).finally(() => {
    if (closingCoupleId.value === id) closingCoupleId.value = undefined
  })
}

loadGroups()
loadCouples()
</script>

<style scoped>
.terminal-state {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
