import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentFilters from "./StudentFilters";
import StudentSessionCalendar from "./StudentSessionCalendar";
import StudentAbsenceList from "./StudentAbsenceList";
import Layout from "./Layout";


interface Course {
  id: number;
  name: string;
  module_name: string;
}


interface StudentProfile {
  name: string;
  email: string;
  // Ajoutez d'autres informations du profil selon vos besoins
}


const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [filterValues, setFilterValues] = useState<{
    period?: string;
    module?: string;
  }>({});
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );


  useEffect(() => {
    const storedStudentId = localStorage.getItem("studentId");
    if (storedStudentId) {
      setStudentId(parseInt(storedStudentId));
      fetchCourses(parseInt(storedStudentId));
      fetchStudentProfile(parseInt(storedStudentId));
    }
  }, []);


  useEffect(() => {
    if (courses.length > 0) {
      setSelectedCourseIds(courses.map((course) => course.id.toString()));
    }
  }, [courses]);


  const fetchCourses = async (studentId: number) => {
    try {
      const response = await axios.get(
        `/api/student-courses?student_id=${studentId}`
      );
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };


  const fetchStudentProfile = async (studentId: number) => {
    try {
      const response = await axios.get(
        `/api/student-profile?student_id=${studentId}`
      );
      setStudentProfile(response.data);
    } catch (error) {
      console.error("Error fetching student profile:", error);
    }
  };

  
  const handleFilterChange = (values: { period?: string; module?: string }) => {
    setFilterValues(values);
  };

  const handleCourseClick = (courseId: string) => {
    if (selectedCourseIds.length === 1 && selectedCourseIds[0] === courseId) {
      setSelectedCourseIds(courses.map((course) => course.id.toString()));
    } else {
      setSelectedCourseIds([courseId]);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Tableau de Bord Étudiant
        </h1>

        {studentProfile && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">
              Profil Étudiant
            </h2>
            <p>Nom : {studentProfile.name}</p>
            <p>Email : {studentProfile.email}</p>
          </div>
        )}

        <StudentFilters
          onFilter={handleFilterChange}
          modules={Array.from(
            new Set(courses.map((course) => course.module_name))
          )}
        />

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-700">Cours</h2>
          <ul className="mt-4">
            {courses.length > 0 ? (
              courses.map((course: Course) => (
                <li
                  key={course.id}
                  onClick={() => handleCourseClick(course.id.toString())}
                  className={`cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                    selectedCourseIds.includes(course.id.toString())
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  {course.name} - {course.module_name}
                </li>
              ))
            ) : (
              <p className="text-gray-500">Aucun cours trouvé.</p>
            )}
          </ul>
        </div>

        {selectedCourseIds.length > 0 && (
          <StudentSessionCalendar
            courseIds={selectedCourseIds}
            studentId={studentId!}
            filterValues={filterValues}
          />
        )}

        {studentId && <StudentAbsenceList studentId={studentId} />}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
