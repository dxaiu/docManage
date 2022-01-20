<template>
  <div class="app-container">
    <el-button
      type="primary"
      plain
      icon="el-icon-plus"
      size="mini"
      @click="handleAdd"
    >新增固件</el-button>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
    >
      <el-table-column prop="version" align="center" label="版本号" />
      <el-table-column prop="name" align="center" label="固件名称" />
      <el-table-column prop="desc" align="center" label="固件描述" />
      <el-table-column prop="md5" align="center" label="MD5" />
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseAt ? '已发布' : '未发布' }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="name" align="center" label="下载地址" /> -->
      <el-table-column label="创建时间" align="center" prop="createdAt">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="releaseAt">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.releaseAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200px">
        <template slot-scope="scope">
          <el-button
            v-if="!scope.row.releaseAt"
            size="mini"
            type="text"
            icon="el-icon-upload"
            @click="handleRelease(scope.row)"
          >发布</el-button>
          <el-button
            v-if="scope.row.releaseAt"
            size="mini"
            type="text"
            icon="el-icon-s-promotion"
            @click="handleRevoke(scope.row)"
          >撤销发布</el-button>
          <el-button
            v-if="scope.row.releaseAt"
            size="mini"
            type="text"
            icon="el-icon-download"
            @click="handleDownload(scope.row)"
          >下载固件</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body @close="cancel">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="form.version" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="固件名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入固件名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="固件描述" prop="desc">
              <el-input
                v-model="form.desc"
                type="textarea"
                :rows="2"
                placeholder="请输入固件描述"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否立即发布" prop="isRelease">
              <el-radio-group v-model="form.isRelease">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item ref="uploadElement" label="上传固件" prop="configFile">
              <el-upload
                ref="upload"
                class="upload-box"
                action="string"
                multiple
                accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.png"
                :limit="1"
                :auto-upload="true"
                :file-list="configFile"
                :on-remove="handleConfigRemove"
                :http-request="UploadConfigImage"
                :on-change="fileChange"
                :before-upload="beforeImgUpload"
                :on-exceed="handleExceed"
              >
                <el-button
                  slot="trigger"
                  size="small"
                  type="primary"
                >上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="openEdit" width="800px" append-to-body @close="cancel">
      <el-form ref="formEdit" :model="formEdit" :rules="rules" label-width="150px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="form.version" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="固件名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入固件名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="固件描述" prop="desc">
              <el-input
                v-model="form.desc"
                type="textarea"
                :rows="2"
                placeholder="请输入固件描述"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否立即发布" prop="isRelease">
              <el-radio-group v-model="form.isRelease">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item ref="uploadElement" label="上传固件" prop="configFile">
              <el-upload
                ref="upload"
                class="upload-box"
                action="string"
                multiple
                accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.png"
                :limit="1"
                :auto-upload="true"
                :file-list="configFile"
                :on-remove="handleConfigRemove"
                :http-request="UploadConfigImage"
                :on-change="fileChange"
                :before-upload="beforeImgUpload"
                :on-exceed="handleExceed"
              >
                <el-button
                  slot="trigger"
                  size="small"
                  type="primary"
                >上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormEdit">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import {
  getVersionList,
  delFirmware,
  addVersion,
  releaseFirmware,
  revokeFirmware,
  updateInfo,
  // uploadImages,
  getImagesInfo
} from '@/api/version'
import { parseTime, resetForm } from '@/utils'

export default {
  name: 'VersionManage',
  components: { Pagination },
  data() {
    return {
      parseTime,
      resetForm,
      // 遮罩层
      loading: true,
      // 表格树数据
      deptList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      openEdit: false,
      // 重新渲染表格状态
      refreshTable: true,
      total: 0,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10
      },
      // 表单参数
      form: {
        version: '',
        name: '',
        desc: '',
        isRelease: true
      },
      formEdit: {
        version: '',
        name: '',
        desc: '',
        isRelease: true
      },
      temp: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: '请输入固件名称', trigger: 'blur' }
        ],
        version: [
          { required: true, message: '请输入版本号', trigger: 'blur' }
        ],
        desc: [
          { required: false, message: '请输入固件描述', trigger: 'blur' }
        ],
        isRelease: [
          { required: true, message: '请选择是否立即发布', trigger: 'change' }
        ],
        configFile: [
          { required: true, message: '请上传固件', trigger: 'change' }
        ]
      },
      configFile: [],
      fileSuffix: '',
      filename: '',
      formFileData: ''

    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      getVersionList(this.queryParams).then(res => {
        this.deptList = res.data.data
        this.total = res.data.total
        this.loading = false
      })
        .catch(() => {
          this.loading = false
        })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.openEdit = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        code: undefined,
        attachResID: undefined
      }
      this.formEdit = {
        code: undefined,
        attachResID: undefined
      }
      this.resetForm('form')
      this.resetForm('formEdit')
      this.configFile = []
    },
    /** 发布按钮操作 */
    handleRelease(row) {
      this.$confirm('是否立即发布版本号为' + row.version + '的数据项？', '发布提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        releaseFirmware(row.firmwareID)
        this.$message({
          type: 'success',
          message: '发布成功!'
        })
        this.getList()
      }).catch(() => {
      })
    },
    /** 撤销发布按钮操作 */
    handleRevoke(row) {
      this.$confirm('是否撤销发布版本号为' + row.version + '的数据项？', '撤销发布提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        revokeFirmware(row.firmwareID)
        this.$message({
          type: 'success',
          message: '撤销成功!'
        })
        this.getList()
      }).catch(() => {
      })
    },
    /** 下载固件按钮操作 */
    handleDownload(row) {
      getImagesInfo(row.resID).then(res => {
        const eleLink = document.createElement('a')
        eleLink.download = JSON.parse(res.data.info).name
        eleLink.href = res.data.url
        eleLink.click()
        eleLink.remove()
      }).catch(() => {
      })
    },

    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.configFile = []
      this.open = true
      this.title = '添加版本'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.formEdit = row
      this.temp = Object.assign({}, this.formEdit)
      this.openEdit = true
      this.title = '修改版本'
      getImagesInfo(this.formEdit.imageResID).then(res => {
        this.fileList.push({
          name: res.data.url.slice(19),
          url: res.data.url.replace(/##/g, 'window.location.hostname')
        })
      })

      getImagesInfo(this.formEdit.attachResID).then(res => {
        this.configFile.push({
          name: res.data.url.slice(19),
          url: res.data.url.replace(/##/g, 'window.location.hostname')
        })
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const arr = {
            name: this.form.name,
            version: this.form.version,
            filename: this.filename,
            desc: this.form.desc,
            isRelease: this.form.isRelease
          }
          this.formFileData.append('info', JSON.stringify(arr))
          addVersion(this.formFileData).then(response => {
            this.$message({
              message: '新增成功',
              type: 'success'
            })
            this.open = false
            this.getList()
          })
        }
      })
    },
    submitFormEdit: function() {
      this.$refs['formEdit'].validate(valid => {
        if (valid) {
          const params = {
            code: this.formEdit.code,
            attachResID: this.formEdit.attachResID
          }
          updateInfo(this.temp.code, params).then(response => {
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.openEdit = false
            this.getList()
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.version + '"的数据项？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delFirmware(row.firmwareID)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      }).catch(() => {
      })
    },
    // 附---------------件-----------------
    handleConfigRemove(file, fileList) {
      this.form.attachResID = ''
      this.configFile = []
    },
    beforeImgUpload(file) {
      // const fileExt = file.name.replace(/.+\./, '')
      const isLt2M = file.size / 1024 / 1024 < 100
      if (!isLt2M) {
        this.$message.error('上传大小不能超过 100MB!')
        return false
      } else {
        return true
      }

      // if (
      //   [
      //     'doc',
      //     'docx',
      //     'pdf',
      //     'xls',
      //     'xlsx',
      //     'ppt',
      //     'pptx',
      //     'zip',
      //     'jpg',
      //     'png',
      //     'apk'
      //   ].indexOf(fileExt.toLowerCase()) === -1
      // ) {
      //   this.$message.error(
      //     '请上传后缀名为.doc/.docx/.pdf/.xls/.xlsx/.ppt/.pptx/.zip/.jpg/.png/.apk的附件！'
      //   )
      //   return false
      // } else {
      //   if (!isLt2M) {
      //     this.$message.error('上传大小不能超过 10MB!')
      //     return false
      //   } else {
      //     return true
      //   }
      // }
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      )
    },
    UploadConfigImage(param) {
      console.log(param, 'param')
      const file = param.file
      const fileName = param.fileName
      this.filename = file.name
      this.formFileData = new FormData()
      // const arr = {
      //   'suffix': 'pdf'
      // }
      this.formFileData.append('file', file, fileName)
      // formData.append('info', JSON.stringify(arr))
      // uploadImages(formData)
      //   .then(res => {
      //     this.form.attachResID = res.data.resID
      //     getImagesInfo(res.data.resID).then(res => {
      //       console.log(res, '000')
      //     })
      //     console.log('上传图片成功')
      //     param.onSuccess() // 上传成功的图片会显示绿色的对勾
      //   })
      //   .catch(() => {
      //     console.log('图片上传失败')
      //     param.onError()
      //   })
    },
    fileChange(file, fileList) {
      if (fileList.length > 0) {
        this.rules.configFile = [
          { required: false, message: '请上传附件', trigger: 'change' }
        ]
      }
      // this.$refs.upload.clearFiles() //清除文件对象
      // this.fileList = [{name: file.name, url: file.url}] // 重新手动赋值filstList
    }

  }
}
</script>
<style lang="scss" scoped>
.dialog-footer {
  margin-top: 50px;
}
</style>
