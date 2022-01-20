<template>
  <div class="app-container">
    <el-button
      type="primary"
      plain
      icon="el-icon-plus"
      size="mini"
      @click="handleAdd"
    >新增配置</el-button>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="parentCode"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="parentCode" label="条目上级代码" />
      <el-table-column prop="code" label="条目代码" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="alphabetZH" label="中文拼音" />
      <el-table-column prop="alphabetEN" label="英文" />
      <el-table-column prop="hasSub" label="是否有下一级条目">
        <template slot-scope="scope">
          <span>{{ scope.row.hasSub === true ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="link" label="条目跳转链接" />
      <el-table-column prop="richText" label="内容" width="400px">
        <template slot-scope="scope">
          <span v-html="scope.row.richText">{{ scope.row.richText }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="180px">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.hasSub === true"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>
          <el-button
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
          >删除</el-button>
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
            <el-form-item label="条目代码" prop="code">
              <el-input v-model="form.code" placeholder="请输入条目代码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否有下一级条目" prop="hasSub">
              <el-radio-group v-model="form.hasSub" @change="changRadio">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="条目上级代码" prop="parentCode">
              <el-input v-model="form.parentCode" placeholder="请输入条目上级代码" />
            </el-form-item>
          </el-col>
          <!-- <el-col v-if="form.hasSub == true" :span="24">
            <el-form-item label="条目上级代码" :rules="form.hasSub == true? [{required: false, message: '请输入条目上级代码', trigger: 'blur' }] : []" prop="parentCode">
              <el-input v-model="form.parentCode" placeholder="请输入条目上级代码" />
            </el-form-item>
          </el-col> -->
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名称拼音" prop="alphabetZH">
              <el-input v-model="form.alphabetZH" placeholder="请输入名称拼音" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名称英文" prop="alphabetEN">
              <el-input v-model="form.alphabetEN" placeholder="请输入名称英文" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="logo图片" prop="logoList">
              <UploadImg
                ref="uploadImg"
                :limit="1"
                :file-list="fileList"
                :on-change="handleChange"
                :http-request="httpRequest"
                @remove="handleRemove"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="条目跳转链接" prop="link">
              <el-input v-model="form.link" placeholder="请输入条目跳转链接" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item ref="uploadElement" label="附件" prop="configFile">
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
          <el-col :span="24">
            <el-form-item label="内容" prop="richText">
              <quill-editor
                ref="myTextEditor"
                :content="form.richText"
                :options="editorOption"
                @change="onEditorChange($event)"
              />
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
            <el-form-item label="条目代码" prop="code">
              <el-input v-model="formEdit.code" placeholder="请输入条目代码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否有下一级条目" prop="hasSub">
              <el-radio-group v-model="formEdit.hasSub" @change="changRadio">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="条目上级代码" prop="parentCode">
              <el-input v-model="formEdit.parentCode" placeholder="请输入条目上级代码" />
            </el-form-item>
          </el-col>
          <!-- <el-col v-if="formEdit.hasSub == true" :span="24">
            <el-form-item label="条目上级代码" :rules="formEdit.hasSub == true? [{required: false, message: '请输入条目上级代码', trigger: 'blur' }] : []" prop="parentCode">
              <el-input v-model="form.parentCode" placeholder="请输入条目上级代码" />
            </el-form-item>
          </el-col> -->
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formEdit.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名称拼音" prop="alphabetZH">
              <el-input v-model="formEdit.alphabetZH" placeholder="请输入名称拼音" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名称英文" prop="alphabetEN">
              <el-input v-model="formEdit.alphabetEN" placeholder="请输入名称英文" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="logo图片" prop="logoList">
              <UploadImg
                ref="uploadImg"
                :limit="1"
                :file-list="fileList"
                :on-change="handleChange"
                :http-request="httpRequest"
                @remove="handleRemove"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="条目跳转链接" prop="link">
              <el-input v-model="formEdit.link" placeholder="请输入条目跳转链接" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item ref="uploadElement" label="附件" prop="configFile">
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
          <el-col :span="24">
            <el-form-item label="内容" prop="richText">
              <quill-editor
                ref="myTextEditor"
                :content="formEdit.richText"
                :options="editorOption"
                @change="onEditorChange($event)"
              />
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
// 工具栏配置
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
  ['blockquote', 'code-block'], // 引用  代码块
  [{ header: 1 }, { header: 2 }], // 1、2 级标题
  [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
  [{ script: 'sub' }, { script: 'super' }], // 上标/下标
  [{ indent: '-1' }, { indent: '+1' }], // 缩进
  // [{'direction': 'rtl'}],                         // 文本方向
  [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
  [{ font: [] }], // 字体种类
  [{ align: [] }], // 对齐方式
  ['clean'], // 清除文本格式
  ['link', 'video'] // 链接、图片、视频'link', 'image', 'video'
]
import Pagination from '@/components/Pagination'
import { getConfigList, delConfig, addConfig, updateConfig, uploadImages, getImagesInfo } from '@/api/config'
import { parseTime, handleTree, resetForm } from '@/utils'
import UploadImg from '@/components/UploadImg'

export default {
  name: 'SystemManage',
  components: { Pagination, UploadImg },
  data() {
    return {
      parseTime,
      handleTree,
      resetForm,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      deptList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      openEdit: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      total: 0,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: -1
      },
      // 表单参数
      form: {
        code: undefined,
        parentCode: undefined,
        hasSub: undefined,
        name: undefined,
        alphabetZH: undefined,
        alphabetEN: undefined,
        imageResID: undefined,
        attachResID: undefined,
        link: undefined,
        richText: undefined
      },
      formEdit: {
        code: undefined,
        parentCode: undefined,
        hasSub: undefined,
        name: undefined,
        alphabetZH: undefined,
        alphabetEN: undefined,
        imageResID: undefined,
        attachResID: undefined,
        link: undefined,
        richText: undefined
      },
      editorOption: {
        theme: 'snow', // or 'bubble'
        placeholder: '请在这里添加描述',
        modules: {
          toolbar: {
            container: toolbarOptions,
            // container: "#toolbar",
            handlers: {
              image: function(value) {
                if (value) {
                  // 触发input框选择图片文件
                  document.querySelector('.avatar-uploader input').click()
                } else {
                  this.quill.format('image', false)
                }
              }
              // link: function(value) {
              //   if (value) {
              //     var href = prompt('请输入url');
              //     this.quill.format("link", href);
              //   } else {
              //     this.quill.format("link", false);
              //   }
              // },
            }
          }
        }
      },
      temp: {},
      // 表单校验
      rules: {
        code: [
          { required: true, message: '请输入条目代码', trigger: 'blur' }
        ],
        parentCode: [
          { required: false, message: '请输入条目上级代码', trigger: 'blur' }
        ],
        hasSub: [
          { required: true, message: '请选择是否有下一级条目', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        alphabetZH: [
          { required: false, message: '请输入名称拼音', trigger: 'blur' }
        ],
        alphabetEN: [
          { required: false, message: '请输入名称英文', trigger: 'blur' }
        ],
        imageURL: [
          { required: false, message: '请输入条目icon链接', trigger: 'blur' }
        ],
        attachmentURL: [
          { required: false, message: '请输入附件链接', trigger: 'blur' }
        ],
        link: [
          { required: false, message: '请输入链接', trigger: 'blur' }
        ],
        richText: [
          { required: false, message: '请输入内容', trigger: 'blur' }
        ],
        logoList: [
          { required: false, message: '请上传logo图片', trigger: 'change' }
        ],
        configFile: [
          { required: false, message: '请上传生产配置', trigger: 'change' }
        ]
      },
      fileList: [],
      logoList: [],
      configFile: [],
      imgSuffix: '',
      fileSuffix: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true
      getConfigList(this.queryParams).then(res => {
        // this.deptList = this.handleTree(res.data.data, 'parentCode')
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
        parentCode: undefined,
        hasSub: undefined,
        name: undefined,
        alphabetZH: undefined,
        alphabetEN: undefined,
        imageResID: undefined,
        attachResID: undefined,
        link: undefined,
        richText: undefined
      }
      this.formEdit = {
        code: undefined,
        parentCode: undefined,
        hasSub: undefined,
        name: undefined,
        alphabetZH: undefined,
        alphabetEN: undefined,
        imageResID: undefined,
        attachResID: undefined,
        link: undefined,
        richText: undefined
      }
      this.resetForm('form')
      this.resetForm('formEdit')
      localStorage.removeItem('oldCode')
      this.fileList = []
      this.configFile = []
      // this.$refs.uploadImg.clearFiles()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.configFile = []
      this.logoList = []
      this.open = true
      this.title = '添加配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.formEdit = {
        code: row.code,
        parentCode: row.parentCode,
        hasSub: !!row.hasSub,
        name: row.name,
        alphabetZH: row.alphabetZH,
        alphabetEN: row.alphabetEN,
        imageResID: row.imageResID,
        attachResID: row.attachResID,
        link: row.link,
        richText: row.richText
      }
      if (this.formEdit.imageResID) {
        getImagesInfo(this.formEdit.imageResID).then(res => {
          this.fileList.push({
            name: res.data.filename,
            url: res.data.url
          })
        })
      }
      if (this.formEdit.attachResID) {
        getImagesInfo(this.formEdit.attachResID).then(res => {
          this.configFile.push({
            name: res.data.filename,
            url: res.data.url
          })
        })
      }

      localStorage.setItem('oldCode', row.code)
      // this.temp = Object.assign({}, this.formEdit)
      this.openEdit = true
      this.title = '修改配置'
    },
    onEditorChange({ editor, html, text }) { // 富文本编辑器  文本改变时 设置字段值
      this.form.richText = html
      this.formEdit.richText = html
    },
    changRadio(val) {
      if (val === false) {
        this.form.parentCode = ''
      }
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          addConfig(this.form).then(response => {
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
            parentCode: this.formEdit.parentCode,
            hasSub: this.formEdit.hasSub,
            name: this.formEdit.name,
            alphabetZH: this.formEdit.alphabetZH,
            alphabetEN: this.formEdit.alphabetEN,
            imageResID: this.formEdit.imageResID,
            attachResID: this.formEdit.attachResID,
            link: this.formEdit.link,
            richText: this.formEdit.richText
          }
          const oldCode = localStorage.getItem('oldCode')
          updateConfig(oldCode, params).then(response => {
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.openEdit = false
            localStorage.removeItem('oldCode')
            this.getList()
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delConfig(row.code)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      }).catch(() => {
      })
    },
    // logo 图片
    httpRequest(option) {
      const file = option.file
      const fileName = option.fileName
      const formData = new FormData()
      const arr = {
        filename: file.name,
        info: '',
        type: 'IMAGE'
      }
      formData.append('file', file, fileName)
      formData.append('info', JSON.stringify(arr))
      this.loading = true
      uploadImages(formData)
        .then(res => {
          this.loading = false
          if (this.open === true) {
            this.form.imageResID = res.data.resID
          }
          if (this.openEdit === true) {
            this.formEdit.imageResID = res.data.resID
          }
          getImagesInfo(res.data.resID).then(res => {
            console.log(res)
          })
        })
        .catch(() => {
          this.loading = false
          this.handleRemove(file)
        })
    },
    handleChange(file, fileList) {
      this.fileList = fileList
      const arr = file.raw.name.split('.')
      this.imgSuffix = arr[arr.length - 1]
      const isImg = this.imgSuffix === 'jpg' ||
      this.imgSuffix === 'png' ||
      // this.imgSuffix === 'bmp' ||
      this.imgSuffix === 'jpeg'
      if (!isImg) {
        this.$message.error('文件错误，请上传jpg/png/jpeg格式文件')
        this.fileList.splice(-1)
      }
      return isImg
    },
    handleRemove(file) {
      this.$refs.uploadImg.abort(file)
      this.form.imageResID = ''
      this.logoList = []
      this.fileList.splice(this.fileList.indexOf(file), 1)
    },
    // 附---------------件-----------------
    handleConfigRemove(file, fileList) {
      this.form.attachResID = ''
      this.configFile = []
    },
    beforeImgUpload(file) {
      const fileExt = file.name.replace(/.+\./, '')
      this.fileSuffix = fileExt.toLowerCase()
      // const isLt2M = file.size / 1024 / 1024 < 10
      // if (
      //   [
      //     'doc',
      //     'pdf'
      //   ].indexOf(fileExt.toLowerCase()) === -1
      // ) {
      //   this.$message.error(
      //     '请上传后缀名为.doc/.pdf的附件！'
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
      const file = param.file
      const fileName = param.fileName
      const formData = new FormData()
      const arr = {
        filename: file.name,
        info: '',
        type: this.fileSuffix.toUpperCase()
      }
      formData.append('file', file, fileName)
      formData.append('info', JSON.stringify(arr))
      uploadImages(formData)
        .then(res => {
          if (this.open === true) {
            this.form.attachResID = res.data.resID
          }
          if (this.openEdit === true) {
            this.formEdit.attachResID = res.data.resID
          }
          getImagesInfo(res.data.resID).then(res => {
            console.log(res, '上传图片成功')
          })
          console.log('上传图片成功')
          param.onSuccess() // 上传成功的图片会显示绿色的对勾
        })
        .catch(() => {
          console.log('图片上传失败')
          param.onError()
        })
    },
    fileChange(file, fileList) {
      if (fileList.length > 0) {
        this.rules.configFile = [
          { required: false, message: '请上传附件', trigger: 'change' }
        ]
      }
    }

  }
}
</script>
<style lang="scss" scoped>
.dialog-footer {
  margin-top: 50px;
}
</style>
<style>
  .ql-container {
    line-height: normal !important;
    height: 300px;
  }
  .ql-snow .ql-tooltip[data-mode=link]::before {
    content: "请输入链接地址:";
  }
  .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
      border-right: 0px;
      content: '保存';
      padding-right: 0px;
  }

  .ql-snow .ql-tooltip[data-mode=video]::before {
      content: "请输入视频地址:";
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: '14px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=small]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=small]::before {
    content: '10px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=large]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=large]::before {
    content: '18px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=huge]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=huge]::before {
    content: '32px';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item::before {
    content: '文本';
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
    content: '标题1';
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
    content: '标题2';
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
    content: '标题3';
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
    content: '标题4';
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
    content: '标题5';
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
    content: '标题6';
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item::before {
    content: '标准字体';
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=serif]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=serif]::before {
    content: '衬线字体';
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=monospace]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=monospace]::before {
    content: '等宽字体';
  }
  </style>
