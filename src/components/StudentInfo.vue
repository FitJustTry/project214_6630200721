<template>
  <div class="student-info">
    <!-- Bootstrap Toast -->
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
          เกิดข้อผิดพลาดในการดึงข้อมูลนิสิต
        </div>
      </div>
    </div>

    <h2 class="text-center mb-4">ข้อมูลนิสิต</h2>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="student" class="card shadow animate__animated animate__fadeIn">
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-6 text-center">
            <h5>รูปภาพที่ 1</h5>
            <img :src="student.image1" alt="รูปนิสิต 1" class="img-fluid rounded-circle student-image" />
          </div>
          <div class="col-md-6 text-center">
            <h5>รูปภาพที่ 2</h5>
            <img :src="student.image2" alt="รูปนิสิต 2" class="img-fluid rounded-circle student-image" />
          </div>
        </div>
        <div class="info-item">
          <strong>ชื่อ-นามสกุล:</strong> {{ student.name }}
        </div>
        <div class="info-item">
          <strong>รหัส:</strong> {{ student.id }}
        </div>
        <div class="info-item">
          <strong>สาขา:</strong> {{ student.major }}
        </div>
        <div class="info-item">
          <strong>โรงเรียนเดิม:</strong> {{ student.school }}
        </div>
        <div class="text-center mt-4">
          <button @click="goToEdit" class="btn btn-success btn-lg">
            <i class="bi bi-pencil-fill me-1"></i> แก้ไขข้อมูล
          </button>
        </div>
      </div>
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
      error: null,
    };
  },
  mounted() {
    this.fetchStudent();
    this.checkForUpdate();
  },
  methods: {
    async fetchStudent() {
      try {
        // Fetch the first student record (or implement a mechanism to select the student)
        const response = await fetch('http://localhost:3000/students');
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลนิสิตได้');
        }
        const data = await response.json();
        if (!data || data.length === 0) {
          throw new Error('ไม่พบข้อมูลนิสิต');
        }
        this.student = data[0]; // Use the first student record
      } catch (error) {
        this.error = error.message;
        const toastElement = document.getElementById('errorToast');
        const toast = new Toast(toastElement);
        toast.show();
      }
    },
    goToEdit() {
      this.$router.push('/edit-student');
    },
    checkForUpdate() {
      const updated = this.$route.query.updated;
      if (updated) {
        const toastElement = document.getElementById('successToast');
        const toast = new Toast(toastElement);
        toast.show();
        this.$router.replace({ query: {} });
        this.fetchStudent(); // Refresh data after update
      }
    },
  },
};
</script>

<style scoped>
.student-info {
  max-width: 800px;
  margin: 0 auto;
}

.student-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border: 3px solid #28a745;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}

.student-image:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.info-item {
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 1.1rem;
  color: #333;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  display: inline-block;
  width: 150px;
  color: #555;
}

.dark-mode .info-item {
  color: #e9ecef;
  border-bottom: 1px solid #6c757d;
}

.dark-mode .info-item strong {
  color: #adb5bd;
}

.btn-success {
  transition: background-color 0.3s;
}

.btn-success:hover {
  background-color: #218838;
}

.dark-mode h2 {
  color: #e9ecef;
}

.dark-mode .toast {
  background-color: #495057;
  color: #e9ecef;
}

.dark-mode .toast-header {
  background-color: #6c757d;
  color: #e9ecef;
}

.dark-mode .toast-header.bg-danger {
  background-color: #dc3545 !important;
}
</style>