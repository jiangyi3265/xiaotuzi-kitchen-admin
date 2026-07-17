<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>厨房 / 店铺设置</span>
      </template>
      <el-form ref="shopRef" :model="form" label-width="110px" style="max-width: 680px">
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

        <el-divider content-position="left">附近的菜市场</el-divider>
        <el-form-item label="市场名称">
		  <el-input v-model="form.storeName" placeholder="请输入菜市场名称" />
        </el-form-item>
        <el-form-item label="市场地址">
		  <el-input v-model="form.storeAddress" placeholder="请输入菜市场详细地址" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="form.businessHours" placeholder="如：10:00 - 21:00" />
        </el-form-item>
        <el-form-item label="联系电话">
		  <el-input v-model="form.storePhone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-divider content-position="left">商家提前备货群</el-divider>
        <el-alert title="小程序用户可在提交订单页查看群二维码，提前把采购清单发给商家备货。" type="info" :closable="false" show-icon style="margin-bottom: 18px" />
        <el-form-item label="群名称">
          <el-input v-model="form.stockGroupName" placeholder="如：今日食材提前备货群" />
        </el-form-item>
        <el-form-item label="群二维码">
          <image-upload v-model="form.stockGroupQr" :limit="1" />
        </el-form-item>
        <el-form-item label="入群说明">
          <el-input v-model="form.stockGroupNotice" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="说明入群方式、备货时间和取货规则" />
        </el-form-item>

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
    form.value = response.data || {}
  })
}

/** 提交按钮 */
function submitForm() {
  saveShop(form.value).then(() => {
    proxy.$modal.msgSuccess("保存成功")
    loadShop()
  })
}

loadShop()
</script>
