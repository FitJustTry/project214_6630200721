<template>
  <div class="edit-course">
    <h2 class="text-center mb-4">แก้ไขวิชา</h2>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="course">
      <form @submit.prevent="updateCourse" class="card shadow-sm p-4">
        <div class="mb-3">
          <label for="courseCode" class="form-label">รหัสวิชา:</label>
          <input
            v-model="course.courseCode"
            id="courseCode"
            type="text"
            class="form-control"
            pattern="[0-9]+"
            title="รหัสวิชาต้องเป็นตัวเลขเท่านั้น"
            maxlength="8"
            required
            @input="validateCourseCode"
          />
          <div v-if="courseCodeError" class="text-danger mt-1">
            {{ courseCodeError }}
          </div>
        </div>
        <div class="mb-3">
          <label for="courseName" class="form-label">ชื่อวิชา:</label>
          <input v-model="course.courseName" id="courseName" class="form-control" maxlength="100" required />
        </div>
        <div class="mb-3">
          <label for="credits" class="form-label">หน่วยกิต:</label>
          <input
            v-model.number="course.credits"
            id="credits"
            type="number"
            class="form-control"
            min="0"
            max="10"
            required
            @input="validateCredits"
          />
          <div v-if="creditsError" class="text-danger mt-1">
            {{ creditsError }}
          </div>
        </div>
        <div class="mb-3">
          <label for="grade" class="form-label">เกรด:</label>
          <select v-model="course.grade" id="grade" class="form-control" required>
            <option value="" disabled>เลือกเกรด</option>
            <option v-for="grade in validGrades" :key="grade" :value="grade">{{ grade }}</option>
          </select>
        </div>
        <div class="text-center">
          <button type="submit" class="btn btn-success me-2" :disabled="courseCodeError || creditsError">
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
export default {
  data() {
    return {
      course: null,
      originalCourseCode: null,
      error: null,
      courseCodeError: null,
      creditsError: null,
      validGrades: ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
    };
  },
  mounted() {
    this.fetchCourse();
  },
  methods: {
    async fetchCourse() {
      try {
        const response = await fetch(`http://localhost:3000/courses/${this.$route.params.id}`);
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลวิชาได้');
        }
        this.course = await response.json();
        this.originalCourseCode = this.course.courseCode;
      } catch (error) {
        this.error = error.message;
      }
    },
    async validateCourseCode() {
      const numericRegex = /^[0-9]+$/;
      if (!numericRegex.test(this.course.courseCode)) {
        this.courseCodeError = 'รหัสวิชาต้องเป็นตัวเลขเท่านั้น';
        return;
      }

      if (this.course.courseCode !== this.originalCourseCode) {
        const response = await fetch(`http://localhost:3000/courses?courseCode=${this.course.courseCode}`);
        const data = await response.json();
        if (data.length > 0) {
          this.courseCodeError = 'รหัสวิชานี้มีอยู่ในระบบแล้ว';
        } else {
          this.courseCodeError = null;
        }
      } else {
        this.courseCodeError = null;
      }
    },
    validateCredits() {
      if (this.course.credits < 0 || this.course.credits > 10) {
        this.creditsError = 'หน่วยกิตต้องอยู่ระหว่าง 0 ถึง 10';
      } else {
        this.creditsError = null;
      }
    },
    async updateCourse() {
      if (this.courseCodeError || this.creditsError) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/courses/${this.$route.params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.course),
        });
        if (!response.ok) {
          throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
        alert('บันทึกข้อมูลสำเร็จ');
        this.$router.push('/courses');
      } catch (error) {
        this.error = error.message;
      }
    },
    cancelEdit() {
      this.$router.push('/courses');
    },
  },
};
</script>

<style scoped>
.edit-course {
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

.dark-mode .form-control option:disabled {
  color: var(--text);
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

.dark-mode .spinner-border {
  color: var(--accent);
}
</style>