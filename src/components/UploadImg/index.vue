<template>
  <div class="upload-img">
    <el-upload
      ref="upload"
      :class="{uoloadSty:showBtnDealImg,disUoloadSty:noneBtnImg}"
      accept="image/jpg,image/png,image/bmp,image/jpeg"
      :action="action"
      :limit="limit"
      :list-type="listType"
      :on-exceed="handleExceed"
      v-bind="$attrs"
    >
      <i class="el-icon-plus" />
      <template #file="{ file }">
        <img class="el-upload-list__item-thumbnail" :src="file.url">
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-delete" @click="handleRemove(file)">
            <i class="el-icon-delete" />
          </span>
        </span>
      </template>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'UploadImg',
  inheritAttrs: false,
  props: {
    action: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: 1
    },
    listType: {
      type: String,
      default: 'picture-card'
    }
  },
  data() {
    return {
      showBtnDealImg: true,
      noneBtnImg: false
    }
  },
  methods: {
    handleExceed() {
      this.$message({
        message: `最多只能传 ${this.limit} 张`,
        type: 'warning'
      })
    },
    handleRemove(file, fileList) {
      this.$emit('remove', file)
      this.noneBtnImg = fileList.length >= this.limit
    },
    clearFiles() {
      return this.$refs.upload.clearFiles()
    },
    abort() {
      return this.$refs.upload.abort()
    },
    submit() {
      return this.$refs.upload.submit()
    }
  }
}
</script>

<style lang="scss">
.upload-img {
  .uoloadSty .el-upload--picture-card{
  width:110px;
  height:110px;
  line-height:110px;
}
.disUoloadSty .el-upload--picture-card{
  display:none;   /* 上传按钮隐藏 */
}
  .uploader {
    .el-upload--picture-card {
      width: 140px;
      background-color: #e7e7e7;
      border: none;
      height: 88px;
      line-height: 88px;
      border-radius: 0;
      [class^='el-icon-'],
      [class*=' el-icon-'] {
        vertical-align: middle;
      }
    }
    .el-upload-list--picture-card {
      .el-upload-list__item {
        width: 140px;
        background-color: #e7e7e7;
        border: none;
        height: 88px;
        line-height: 88px;
        border-radius: 0;
        margin: 0 10px 10px 0;
      }
    }
  }
}
</style>
