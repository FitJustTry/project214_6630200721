<template>
  <div class="courses">
    <h2 class="text-center mb-4">รายละเอียดการเรียน</h2>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else>
      <div class="mb-3">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control search-input"
          placeholder="ค้นหาวิชา (รหัสวิชา หรือ ชื่อวิชา)"
        />
      </div>
      <table v-if="filteredCourses.length" class="table table-striped table-bordered shadow-sm animate__animated animate__fadeIn">
        <thead class="table-success">
          <tr>
            <th>รหัสวิชา</th>
            <th>ชื่อวิชา</th>
            <th>หน่วยกิต</th>
            <th>เกรด</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in filteredCourses" :key="course.id">
            <td>{{ course.courseCode }}</td>
            <td>{{ course.courseName }}</td>
            <td>{{ course.credits }}</td>
            <td>{{ course.grade }}</td>
            <td>
              <button @click="editCourse(course)" class="btn btn-success btn-sm me-2">
                <i class="bi bi-pencil-fill me-1"></i> แก้ไข
              </button>
              <button @click="showDeleteModal(course.id)" class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal">
                <i class="bi bi-trash-fill me-1"></i> ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-center">
        <p>ไม่พบวิชาที่ตรงกับการค้นหา</p>
      </div>
    </div>

    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">ยืนยันการลบ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            คุณแน่ใจหรือไม่ว่าต้องการลบวิชานี้?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete" data-bs-dismiss="modal">ลบ</button>
          </div>
        </div>
      </div>
    </div>

    <h3 class="text-center mt-5 mb-4">เพิ่มวิชาใหม่</h3>
    <form @submit.prevent="addCourse" class="card shadow-sm p-4 animate__animated animate__fadeIn">
      <div class="mb-3">
        <label for="courseCode" class="form-label">รหัสวิชา:</label>
        <input
          v-model="newCourse.courseCode"
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
        <input v-model="newCourse.courseName" id="courseName" class="form-control" maxlength="100" required />
      </div>
      <div class="mb-3">
        <label for="credits" class="form-label">หน่วยกิต:</label>
        <input
          v-model.number="newCourse.credits"
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
        <select v-model="newCourse.grade" id="grade" class="form-control" required>
          <option value="" disabled>เลือกเกรด</option>
          <option v-for="grade in validGrades" :key="grade" :value="grade">{{ grade }}</option>
        </select>
      </div>
      <div class="text-center">
        <button type="submit" class="btn btn-success" :disabled="courseCodeError || creditsError">
          <i class="bi bi-plus-circle-fill me-1"></i> เพิ่มวิชา
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      courses: [],
      error: null,
      studentId: null,
      newCourse: {
        studentId: null,
        courseCode: '',
        courseName: '',
        credits: 0,
        grade: '',
      },
      courseIdToDelete: null,
      courseCodeError: null,
      creditsError: null,
      searchQuery: '',
      validGrades: ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'P', 'DROP'],
    };
  },
  computed: {
    filteredCourses() {
      if (!this.searchQuery) {
        return this.courses;
      }
      const query = this.searchQuery.toLowerCase();
      return this.courses.filter(course =>
        course.courseCode.toLowerCase().includes(query) ||
        course.courseName.toLowerCase().includes(query)
      );
    },
  },
  mounted() {
    this.fetchStudentId();
  },
  methods: {
    async fetchStudentId() {
      try {
        const response = await fetch('http://localhost:3000/students');
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลนิสิตได้');
        }
        const data = await response.json();
        if (!data || data.length === 0) {
          throw new Error('ไม่พบข้อมูลนิสิต');
        }
        this.studentId = data[0].id;
        this.newCourse.studentId = this.studentId;
        this.fetchCourses();
      } catch (error) {
        this.error = error.message;
      }
    },
    async fetchCourses() {
      try {
        const encodedStudentId = encodeURIComponent(this.studentId);
        const response = await fetch(`http://localhost:3000/courses?studentId=${encodedStudentId}`);
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลวิชาได้');
        }
        this.courses = await response.json();
      } catch (error) {
        this.error = error.message;
      }
    },
    async validateCourseCode() {
      const numericRegex = /^[0-9]+$/;
      if (!numericRegex.test(this.newCourse.courseCode)) {
        this.courseCodeError = 'รหัสวิชาต้องเป็นตัวเลขเท่านั้น';
        return;
      }

      const response = await fetch(`http://localhost:3000/courses?courseCode=${this.newCourse.courseCode}`);
      const data = await response.json();
      if (data.length > 0) {
        this.courseCodeError = 'รหัสวิชานี้มีอยู่ในระบบแล้ว';
      } else {
        this.courseCodeError = null;
      }
    },
    validateCredits() {
      if (this.newCourse.credits < 0 || this.newCourse.credits > 10) {
        this.creditsError = 'หน่วยกิตต้องอยู่ระหว่าง 0 ถึง 10';
      } else {
        this.creditsError = null;
      }
    },
    async addCourse() {
      if (this.courseCodeError || this.creditsError) {
        return;
      }

      try {
        await fetch('http://localhost:3000/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newCourse),
        });
        this.fetchCourses();
        this.newCourse.courseCode = '';
        this.newCourse.courseName = '';
        this.newCourse.credits = 0;
        this.newCourse.grade = '';
      } catch (error) {
        this.error = 'เกิดข้อผิดพลาดในการเพิ่มวิชา';
      }
    },
    showDeleteModal(id) {
      this.courseIdToDelete = id;
    },
    async confirmDelete() {
      if (this.courseIdToDelete) {
        try {
          await fetch(`http://localhost:3000/courses/${this.courseIdToDelete}`, {
            method: 'DELETE',
          });
          this.fetchCourses();
          this.courseIdToDelete = null;
        } catch (error) {
          this.error = 'เกิดข้อผิดพลาดในการลบวิชา';
        }
      }
    },
    editCourse(course) {
      if (!course.id) {
        this.error = 'ไม่สามารถแก้ไขวิชาได้: ไม่พบ ID ของวิชา';
        return;
      }
      this.$router.push({ name: 'EditCourse', params: { id: course.id } });
    },
  },
};
</script>

<style scoped>
.courses {
  max-width: 1000px;
  margin: 0 auto;
}

.table th, .table td {
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: #e9ecef;
  transition: background-color 0.3s;
}

.btn-success, .btn-danger {
  transition: background-color 0.3s;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger:hover {
  background-color: #c82333;
}

.dark-mode h2,
.dark-mode h3 {
  color: #e9ecef;
}

.dark-mode .table-success {
  background-color: #28a745;
}

.dark-mode .table tbody tr:hover {
  background-color: #6c757d;
}

.dark-mode .modal-content {
  background-color: #495057;
  color: #e9ecef;
}

.dark-mode .modal-header,
.dark-mode .modal-footer {
  border-color: #6c757d;
}

.dark-mode .modal-title {
  color: #e9ecef;
}

.dark-mode .btn-close {
  filter: invert(1);
}

/* Dark mode styling for search input */
.dark-mode .search-input {
  background-color: #495057;
  color: #e9ecef;
  border-color: #28a745; /* Contrasting green border */
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.dark-mode .search-input:focus {
  background-color: #495057;
  color: #e9ecef;
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);
}

/* Placeholder styling for dark mode */
.dark-mode .search-input::placeholder {
  color: #adb5bd;
  opacity: 1; /* Ensure placeholder is fully visible */
}

/* Optional: Light mode styling for consistency */
.search-input {
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}
</style>