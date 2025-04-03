<template>
  <div class="edit-student">
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div id="successToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">แจ้งเตือน</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          บันทึกข้อมูลนิสิตสำเร็จแล้ว!
        </div>
      </div>
      <div id="errorToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-danger text-white">
          <strong class="me-auto">ข้อผิดพลาด</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          เกิดข้อผิดพลาดในการบันทึกข้อมูล
        </div>
      </div>
    </div>

    <h2 class="text-center mb-4">แก้ไขข้อมูลนิสิต</h2>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="student">
      <form @submit.prevent="updateStudent" class="card shadow-sm p-4">
        <div class="mb-3">
          <label for="name" class="form-label">ชื่อ-นามสกุล:</label>
          <input v-model="student.name" id="name" class="form-control" maxlength="100" required />
        </div>
        <div class="mb-3">
          <label for="id" class="form-label">รหัส:</label>
          <input
            v-model="student.id"
            id="id"
            type="text"
            class="form-control"
            pattern="[0-9]+"
            title="รหัสต้องเป็นตัวเลขเท่านั้น"
            maxlength="10"
            required
            @input="validateStudentId"
          />
          <div v-if="studentIdError" class="text-danger mt-1">
            {{ studentIdError }}
          </div>
        </div>
        <div class="mb-3">
          <label for="major" class="form-label">สาขา:</label>
          <input v-model="student.major" id="major" class="form-control" maxlength="50" required />
        </div>
        <div class="mb-3">
          <label for="school" class="form-label">โรงเรียนเดิม:</label>
          <input v-model="student.school" id="school" class="form-control" maxlength="100" required />
        </div>
        <div class="mb-3">
          <label for="image1" class="form-label">รูปภาพที่ 1:</label>
          <input v-model="student.image1" id="image1" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="image2" class="form-label">รูปภาพที่ 2:</label>
          <input v-model="student.image2" id="image2" class="form-control" required />
        </div>
        <div class="text-center">
          <button type="submit" class="btn btn-success me-2" :disabled="studentIdError">
            <i class="bi bi-save-fill me-1"></i> บันทึก
          </button>
          <button type="button" @click="cancelEdit" class="btn btn-danger">
            <i class="bi bi-x-circle-fill me-1"></i> ยกเลิก
          </button>
        </div>
      </form>
    </div>
    <div v-else class="text-center">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'bootstrap';

export default {
  data() {
    return {
      student: null,
      originalId: null,
      error: null,
      studentIdError: null,
      hasUnsavedChanges: false,
    };
  },
  mounted() {
    this.fetchStudent();
  },
  watch: {
    student: {
      deep: true,
      handler() {
        this.hasUnsavedChanges = true;
      },
    },
  },
  methods: {
    async fetchStudent() {
      try {
        const response = await fetch('http://localhost:3000/students');
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลนิสิตได้');
        }
        const data = await response.json();
        if (!data || data.length === 0) {
          throw new Error('ไม่พบข้อมูลนิสิต');
        }
        this.student = data[0];
        this.originalId = data[0].id;
        this.hasUnsavedChanges = false;
      } catch (error) {
        this.error = error.message;
        const toastElement = document.getElementById('errorToast');
        const toast = new Toast(toastElement);
        toast.show();
      }
    },
    async validateStudentId() {
      const numericRegex = /^[0-9]+$/;
      if (!numericRegex.test(this.student.id)) {
        this.studentIdError = 'รหัสต้องเป็นตัวเลขเท่านั้น';
        return;
      }

      if (this.student.id !== this.originalId) {
        const response = await fetch(`http://localhost:3000/students/${encodeURIComponent(this.student.id)}`);
        if (response.ok) {
          this.studentIdError = 'รหัสนี้มีอยู่ในระบบแล้ว';
        } else {
          this.studentIdError = null;
        }
      } else {
        this.studentIdError = null;
      }
    },
    async updateStudent() {
      if (this.studentIdError) {
        return;
      }

      try {
        if (this.student.id !== this.originalId) {
          const encodedOriginalId = encodeURIComponent(this.originalId);
          const coursesResponse = await fetch(`http://localhost:3000/courses?studentId=${encodedOriginalId}`);
          if (!coursesResponse.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลวิชาได้');
          }
          const courses = await coursesResponse.json();

          const deleteResponse = await fetch(`http://localhost:3000/students/${encodedOriginalId}`, {
            method: 'DELETE',
          });
          if (!deleteResponse.ok) {
            throw new Error('ไม่สามารถลบข้อมูลนิสิตเก่าได้');
          }

          const createResponse = await fetch('http://localhost:3000/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.student),
          });
          if (!createResponse.ok) {
            throw new Error('ไม่สามารถสร้างข้อมูลนิสิตใหม่ได้');
          }

          const encodedNewId = encodeURIComponent(this.student.id);
          const updatePromises = courses.map(course => {
            course.studentId = this.student.id;
            return fetch(`http://localhost:3000/courses/${course.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(course),
            });
          });
          await Promise.all(updatePromises);
        } else {
          const encodedId = encodeURIComponent(this.student.id);
          const response = await fetch(`http://localhost:3000/students/${encodedId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.student),
          });
          if (!response.ok) {
            throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
          }
        }

        this.hasUnsavedChanges = false;
        const toastElement = document.getElementById('successToast');
        const toast = new Toast(toastElement);
        toast.show();
        this.$router.push({ path: '/student-info', query: { updated: true } });
      } catch (error) {
        this.error = error.message;
        const toastElement = document.getElementById('errorToast');
        const toast = new Toast(toastElement);
        toast.show();
      }
    },
    cancelEdit() {
      if (this.hasUnsavedChanges && !confirm('คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่?')) {
        return;
      }
      this.$router.push('/student-info');
    },
  },
};
</script>

<style scoped>
.edit-student {
  max-width: 600px;
  margin: 0 auto;
}

.form-control {
  transition: all 0.3s ease;
}

.dark-mode .form-control {
  background-color: var(--surface);
  color: var(--text);
  border-color: var(--border);
}

.dark-mode .form-control:focus {
  background-color: var(--surface);
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.dark-mode .form-control::placeholder {
  color: var(--text-secondary);
  opacity: 1;
}

.dark-mode .form-label {
  color: var(--text);
}

.btn-success {
  transition: background-color 0.3s;
}

.btn-success:hover {
  background-color: #218838;
}

.dark-mode .btn-success {
  background-color: var(--accent);
  border-color: var(--accent);
}

.dark-mode .btn-success:hover {
  background-color: #218838;
  border-color: #218838;
}

.btn-danger {
  transition: background-color 0.3s;
}

.btn-danger:hover {
  background-color: #c82333;
}

.dark-mode .btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.dark-mode .btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.dark-mode .card {
  background-color: var(--surface);
  color: var(--text);
}

.dark-mode h2 {
  color: var(--text);
}

.dark-mode .toast {
  background-color: var(--surface);
  color: var(--text);
}

.dark-mode .toast-header {
  background-color: var(--border);
  color: var(--text);
}

.dark-mode .toast-header.bg-danger {
  background-color: #dc3545 !important;
  color: #ffffff;
}

.dark-mode .spinner-border {
  color: var(--accent);
}
</style>