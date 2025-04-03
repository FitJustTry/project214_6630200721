<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <nav class="navbar navbar-expand-lg navbar-dark" :class="isDarkMode ? 'bg-dark' : 'bg-success'">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">ระบบข้อมูลนิสิต</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/student-info" class="nav-link">
                <i class="bi bi-person-fill me-1"></i> ข้อมูลนิสิต
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/courses" class="nav-link">
                <i class="bi bi-book-fill me-1"></i> รายละเอียดการเรียน
              </router-link>
            </li>
          </ul>
          <button @click="toggleDarkMode" class="btn" :class="isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'">
            <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
            {{ isDarkMode ? 'โหมดสว่าง' : 'โหมดมืด' }}
          </button>
        </div>
      </div>
    </nav>
    <div class="container mt-4">
      <router-view />
    </div>
    <footer class="text-center py-3 mt-5" :class="isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'">
      <p class="mb-0">พัฒนาโดย นาย วงศพัทธ์ ปิยัง (6630200721) | Project 214 Practicum in Software Development</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDarkMode: false,
    };
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
    },
  },
  mounted() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      this.isDarkMode = JSON.parse(savedMode);
    }
  },
};
</script>

<style>
#app {
  font-family: 'Kanit', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: background-color 0.3s, color 0.3s;
}

#app.dark-mode {
  background: linear-gradient(135deg, #343a40 0%, #212529 100%);
  color: #e9ecef;
}

#app.dark-mode .card {
  background-color: #495057;
  color: #e9ecef;
}

#app.dark-mode .table {
  background-color: #495057;
  color: #e9ecef;
}

#app.dark-mode .table-striped tbody tr:nth-of-type(odd) {
  background-color: #6c757d;
}

#app.dark-mode .form-control {
  background-color: #6c757d;
  color: #e9ecef;
  border-color: #adb5bd;
}

#app.dark-mode .form-control:focus {
  background-color: #6c757d;
  color: #e9ecef;
  border-color: #adb5bd;
  box-shadow: 0 0 0 0.25rem rgba(173, 181, 189, 0.25);
}

#app.dark-mode .form-label {
  color: #e9ecef;
}

.navbar-brand {
  font-weight: 500;
}

.nav-link {
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ffeb3b !important;
}
</style>