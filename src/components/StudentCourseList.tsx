// src/components/StudentCourseList.tsx
import React, { useState, useEffect } from 'react';

const StudentCourseList: React.FC = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/student/courses"); // Mettez à jour l'URL en fonction de votre API
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <h1>My Courses</h1>
      <ul>
        {courses.map((course: any) => (
          <li key={course.id}>
            {course.name} - {course.module_name}
            {/* Ajoutez ici des boutons ou des liens pour visualiser les sessions et marquer la présence */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentCourseList;
