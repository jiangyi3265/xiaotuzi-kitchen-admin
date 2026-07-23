<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>厨房 / 店铺设置</span>
      </template>
      <el-form ref="shopRef" :model="form" label-width="110px" style="max-width: 880px">
        <el-divider content-position="left">基础信息</el-divider>
        <el-form-item label="厨房名称">
          <el-input v-model="form.shopName" placeholder="请输入厨房名称" />
        </el-form-item>
        <el-form-item label="口号/副标题">
          <el-input v-model="form.subtitle" placeholder="如：世间万物，唯有美食不可辜负" />
        </el-form-item>
        <el-form-item label="厨房头像">
          <image-upload v-model="form.avatar" :limit="1" />
        </el-form-item>
        <el-form-item label="背景图">
          <image-upload v-model="form.banner" :limit="1" />
        </el-form-item>

        <el-divider content-position="left">关注公众号</el-divider>
        <el-alert title="该二维码会展示在小程序“我的”页面，用户可长按识别。" type="info" :closable="false" show-icon style="margin-bottom: 18px" />
        <el-form-item label="公众号二维码">
          <image-upload v-model="form.officialAccountQr" :limit="1" />
        </el-form-item>

        <el-divider content-position="left">邀请下单</el-divider>
        <el-form-item label="邀请封面">
          <image-upload v-model="form.inviteCover" :limit="1" />
        </el-form-item>
        <el-form-item label="邀请文案">
          <el-input v-model="form.inviteText" type="textarea" :rows="2" maxlength="150" show-word-limit />
        </el-form-item>

        <el-divider content-position="left">收款码（线下收款）</el-divider>
        <el-form-item label="微信收款码">
          <image-upload v-model="form.wechatQr" :limit="1" />
        </el-form-item>
        <el-form-item label="支付宝收款码">
          <image-upload v-model="form.alipayQr" :limit="1" />
        </el-form-item>

        <el-divider content-position="left">附近的菜市场与备货群</el-divider>
        <el-alert title="可配置多个菜市场；每个市场对应自己的备货群。填写经纬度后，小程序会按用户距离排序。" type="info" :closable="false" show-icon style="margin-bottom: 18px" />
        <el-card v-for="(market, index) in (form.markets || [])" :key="market.id || `new-${index}`" shadow="never" class="market-card">
          <template #header>
            <div class="market-card-head">
              <span>菜市场 {{ index + 1 }}：{{ market.marketName || "未命名" }}</span>
              <el-button link type="danger" icon="Delete" @click="removeMarket(index)">移除</el-button>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="市场名称" required>
                <el-input v-model="market.marketName" placeholder="请输入菜市场名称" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示状态">
                <el-switch v-model="market.status" active-value="0" inactive-value="1" active-text="显示" inactive-text="停用" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="市场地址" required>
            <el-input v-model="market.marketAddress" placeholder="请输入菜市场详细地址" maxlength="255" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="营业时间">
                <el-input v-model="market.businessHours" placeholder="如：06:00 - 18:00" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="market.phone" placeholder="请输入联系电话" maxlength="30" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="纬度">
                <el-input-number v-model="market.latitude" :min="-90" :max="90" :precision="7" :controls="false" placeholder="可选" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="经度">
                <el-input-number v-model="market.longitude" :min="-180" :max="180" :precision="7" :controls="false" placeholder="可选" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="显示排序">
                <el-input-number v-model="market.orderNum" :min="0" controls-position="right" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider content-position="left">该市场的提前备货群</el-divider>
          <el-form-item label="群名称">
            <el-input v-model="market.stockGroupName" placeholder="如：迎龙市场提前备货群" maxlength="100" />
          </el-form-item>
          <el-form-item label="群二维码">
            <image-upload v-model="market.stockGroupQr" :limit="1" />
          </el-form-item>
          <el-form-item label="入群说明">
            <el-input v-model="market.stockGroupNotice" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="说明入群方式、备货时间和取货规则" />
          </el-form-item>
        </el-card>
        <el-button type="primary" plain icon="Plus" @click="addMarket">新增菜市场</el-button>

        <el-divider content-position="left">公告</el-divider>
        <el-form-item label="公告开关">
          <el-switch v-model="form.announceEnabled" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="公告标题">
          <el-input v-model="form.announceTitle" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input v-model="form.announceContent" type="textarea" :rows="3" placeholder="请输入公告内容" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" v-hasPermi="['kitchen:shop:edit']">保 存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="Shop">
import { getShop, saveShop } from "@/api/kitchen/shop"

const { proxy } = getCurrentInstance()

const form = ref({})

/** 加载店铺设置 */
function loadShop() {
  getShop().then(response => {
    const shop = response.data || {}
    let markets = Array.isArray(shop.markets) ? shop.markets : []
    if (!markets.length && (shop.storeName || shop.storeAddress)) {
      markets = [{
        marketName: shop.storeName || "",
        marketAddress: shop.storeAddress || "",
        businessHours: shop.businessHours || "",
        phone: shop.storePhone || "",
        stockGroupQr: shop.stockGroupQr || "",
        stockGroupName: shop.stockGroupName || "",
        stockGroupNotice: shop.stockGroupNotice || "",
        latitude: undefined,
        longitude: undefined,
        orderNum: 0,
        status: "0"
      }]
    }
    form.value = { ...shop, markets }
  })
}

function addMarket() {
  if (!Array.isArray(form.value.markets)) form.value.markets = []
  if (form.value.markets.length >= 100) {
    proxy.$modal.msgWarning("菜市场最多配置100个")
    return
  }
  form.value.markets.push({
    marketName: "",
    marketAddress: "",
    businessHours: "",
    phone: "",
    latitude: undefined,
    longitude: undefined,
    stockGroupQr: "",
    stockGroupName: "",
    stockGroupNotice: "",
    orderNum: form.value.markets.length,
    status: "0"
  })
}

function removeMarket(index) {
  form.value.markets.splice(index, 1)
}

/** 提交按钮 */
function submitForm() {
  const invalid = (form.value.markets || []).some(market => !String(market.marketName || "").trim() || !String(market.marketAddress || "").trim())
  if (invalid) {
    proxy.$modal.msgWarning("请完整填写每个菜市场的名称和地址")
    return
  }
  saveShop(form.value).then(() => {
    proxy.$modal.msgSuccess("保存成功")
    loadShop()
  })
}

loadShop()
</script>

<style scoped>
.market-card { margin-bottom: 18px; }
.market-card-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-weight: 600; }
</style>
