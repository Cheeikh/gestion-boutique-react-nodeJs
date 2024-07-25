import mysql from 'mysql2/promise';

const initData = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'testuser',
    password: 'Csmuzumaki123!!',
    database: 'gestion_pedagogique'
  });

  // Créer les tables
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      module VARCHAR(255) NOT NULL,
      semester VARCHAR(255) NOT NULL,
      classes JSON NOT NULL
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      course_id VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      startTime TIME NOT NULL,
      endTime TIME NOT NULL,
      status VARCHAR(255) NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  const coursesData = [
    {
      id: '1',
      name: 'Introduction à la programmation',
      module: 'Informatique',
      semester: 'S1',
      classes: JSON.stringify(['L1 Info', 'L1 Math-Info'])
    },
    {
      id: '2',
      name: 'Algèbre linéaire',
      module: 'Mathématiques',
      semester: 'S1',
      classes: JSON.stringify(['L1 Math', 'L1 Math-Info'])
    },
  ];

  const sessionsData = [
    {
      id: '1',
      course_id: '1',
      date: '2024-09-01',
      startTime: '09:00',
      endTime: '11:00',
      status: 'scheduled'
    },
    {
      id: '2',
      course_id: '1',
      date: '2024-09-08',
      startTime: '09:00',
      endTime: '11:00',
      status: 'scheduled'
    },
  ];

  // Insérer les cours
  for (const course of coursesData) {
    await connection.execute(
      'INSERT INTO courses (id, name, module, semester, classes) VALUES (?, ?, ?, ?, ?)',
      [course.id, course.name, course.module, course.semester, course.classes]
    );
    console.log('Cours inséré:', course.name);
  }

  // Insérer les sessions
  for (const session of sessionsData) {
    await connection.execute(
      'INSERT INTO sessions (id, course_id, date, startTime, endTime, status) VALUES (?, ?, ?, ?, ?, ?)',
      [session.id, session.course_id, session.date, session.startTime, session.endTime, session.status]
    );
    console.log('Session insérée pour le cours:', session.course_id);
  }

  console.log('Données initialisées avec succès');
  await connection.end();
};

initData().catch(console.error);