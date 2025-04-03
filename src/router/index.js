import { createRouter, createWebHistory } from 'vue-router';
import StudentInfo from '../components/StudentInfo.vue';
import EditStudent from '../components/EditStudent.vue';
import Courses from '../components/Courses.vue';
import EditCourse from '../components/EditCourse.vue';

const routes = [
  { path: '/student-info', component: StudentInfo },
  { path: '/edit-student', component: EditStudent },
  { path: '/courses', component: Courses },
  { path: '/edit-course/:id', name: 'EditCourse', component: EditCourse },
  { path: '/', redirect: '/student-info' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;