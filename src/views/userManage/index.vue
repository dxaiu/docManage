<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增用户</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="userList">
          <el-table-column label="用户ID" align="center" prop="userID" :show-overflow-tooltip="true" />
          <el-table-column label="用户名称" align="center" prop="username" :show-overflow-tooltip="true" />
          <el-table-column label="用户名称" align="center" prop="username" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间" align="center" prop="createdAt">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.username === username"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-if="scope.row.username !== username"
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
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="400px" append-to-body @close="cancel">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="用户名称" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="openEdit" width="400px" append-to-body @close="cancel">
      <el-form ref="formEdit" :model="formEdit" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="用户名称" prop="username">
              <el-input v-model="formEdit.username" placeholder="请输入用户名称" maxlength="30" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="旧密码" prop="oldpassword">
              <el-input v-model="formEdit.oldpassword" placeholder="请输入旧密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="新密码" prop="newpassword">
              <el-input v-model="formEdit.newpassword" placeholder="请输入新密码" type="password" maxlength="20" show-password />
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
import { parseTime, resetForm } from '@/utils'
import { getUserList, addUser, updateUser, delUser } from '@/api/customer'
import { mapGetters } from 'vuex'

export default {
  name: 'User',
  components: {
    Pagination
  },
  data() {
    return {
      parseTime,
      resetForm,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      openEdit: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10
      },
      form: {},
      formEdit: {},
      // 表单校验
      rules: {
        username: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '用户密码不能为空', trigger: 'blur' },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'username'
    ])
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true
      getUserList(this.queryParams).then(res => {
        this.userList = res.data.data
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
      this.title = ''
      this.form = {
        username: undefined,
        password: undefined
      }
      this.formEdit = {
        username: undefined,
        oldpassword: undefined,
        newpassword: undefined
      }
      this.resetForm('form')
      this.resetForm('formEdit')
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加用户'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.formEdit = {
        username: row.username,
        oldpassword: '',
        newpassword: ''
      }
      this.openEdit = true
      this.title = '修改用户'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          addUser(this.form).then(response => {
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
            new: this.formEdit.newpassword,
            old: this.formEdit.oldpassword
          }
          updateUser(params).then(response => {
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
      this.$confirm('是否确认删除用户"' + row.username + '"的数据项？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delUser(row.username).then(() => {
        })
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      }).catch(() => {
      })
    }
  }
}
</script>
