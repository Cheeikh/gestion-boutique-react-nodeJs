import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'testuser',
  password: 'Csmuzumaki123!!',
  database: 'gestion_pedagogique',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fonction pour envoyer des notifications (implémentation simplifiée)
const sendNotification = (studentId, message) => {
  console.log(`Notification sent to student ${studentId}: ${message}`);
};

// Endpoint pour récupérer les cours
app.get('/api/courses', async (req, res) => {
  const query = `
    SELECT 
      courses.id, 
      courses.professor_id, 
      courses.module_id, 
      modules.name AS module_name, 
      courses.semester_id, 
      semesters.name AS semester_name, 
      semesters.year_id, 
      courses.global_hours,
      courses.name AS course_name,
      classes.name AS class_name,
      classes.program,
      classes.level
    FROM courses 
    JOIN modules ON courses.module_id = modules.id 
    JOIN semesters ON courses.semester_id = semesters.id
    JOIN classes ON courses.class_id = classes.id
  `;
  try {
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses.' });
  }
});

// Endpoint pour récupérer les sessions
app.get('/api/sessions', async (req, res) => {
  const courseId = req.query.course_id;
  let query = 'SELECT * FROM sessions';
  const params = [];
  if (courseId) {
    query += ' WHERE course_id = ?';
    params.push(courseId);
  }
  try {
    const [rows] = await pool.query(query, params);
    console.log('Sessions returned:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Error fetching sessions.' });
  }
});

// Endpoint pour enregistrer une demande d'annulation
app.post('/api/cancellation_requests', async (req, res) => {
  const { sessionId, reason, comments } = req.body;

  if (!sessionId || !reason || !comments) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  try {
    await pool.query(
      'INSERT INTO cancellation_requests (session_id, reason, comments) VALUES (?, ?, ?)',
      [sessionId, reason, comments]
    );
    res.status(201).json({ message: 'Demande d\'annulation enregistrée avec succès.' });
  } catch (error) {
    console.error('Error registering cancellation request:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la demande.' });
  }
});

// Endpoint pour se connecter
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = rows[0];
    const [studentRows] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const studentId = studentRows[0].id;
    const redirectTo = user.role === 'Student' ? '/student/dashboard' : '/';

    return res.json({
      success: true,
      user: {
        id: user.id,
        studentId: studentId,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      redirectTo: redirectTo,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error during login.' });
  }
});

// Endpoint pour récupérer les cours de l'étudiant
app.get('/api/student-courses', async (req, res) => {
  const studentId = req.query.student_id;
  console.log('Received studentId for student courses:', studentId);
  if (!studentId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM courses WHERE id IN (SELECT course_id FROM student_courses WHERE student_id = ?)',
      [studentId]
    );

    console.log('Courses found:', rows);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ error: 'Error fetching student courses.' });
  }
});

// Endpoint pour récupérer les absences de l'étudiant
app.get('/api/absences', async (req, res) => {
  const studentId = req.query.student_id;
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required.' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM absences WHERE student_id = ?',
      [studentId]
    );

    // Calculer les heures totales d'absence
    const totalHours = rows.reduce((acc, absence) => acc + absence.hours, 0);

    // Envoyer des notifications basées sur le nombre d'heures
    if (totalHours >= 10 && totalHours < 20) {
      sendNotification(studentId, 'Alerte : Vous avez atteint 10 heures d\'absence.');
    } else if (totalHours >= 20) {
      sendNotification(studentId, 'Convocation : Vous avez atteint 20 heures d\'absence.');
    }

    res.json(rows);
  } catch (error) {
    console.error('Error fetching absences:', error);
    res.status(500).json({ error: 'Error fetching absences.' });
  }
});

// Endpoint pour justifier une absence
app.post('/api/absences/justify', async (req, res) => {
  const { student_id, session_id, date, justification } = req.body;

  if (!student_id || !session_id || !date || !justification) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  try {
    // Vérifier si l'absence a déjà été justifiée
    const [absenceRows] = await pool.query('SELECT is_justified FROM absences WHERE student_id = ? AND session_id = ? AND date = ?', [student_id, session_id, date]);
    console.log('Absence rows:', absenceRows);
    if (absenceRows.length > 0 && absenceRows[0].is_justified) {
      return res.status(403).json({ error: 'Cette absence a déjà été justifiée.' });
    }

    await pool.query(
      'INSERT INTO absences (student_id, session_id, date, is_justified, justification) VALUES (?, ?, ?, TRUE, ?)', 
      [student_id, session_id, date, justification]
    );
    res.status(201).json({ message: 'Justification d\'absence enregistrée avec succès.' });
  } catch (error) {
    console.error('Error justifying absence:', error);
    res.status(500).json({ error: 'Erreur lors de la justification de l\'absence.' });
  }
});

// Endpoint pour marquer la présence
app.post('/api/attendance', async (req, res) => {
  const { sessionId, studentId, status } = req.body;

  if (!sessionId || !studentId || !status) {
    return res.status(400).json({ error: 'Session ID, Student ID, and Status are required.' });
  }

  try {
    const [sessionRows] = await pool.query('SELECT start_time FROM sessions WHERE id = ?', [sessionId]);
    if (sessionRows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const sessionStart = new Date(sessionRows[0].start_time);
    const currentTime = new Date();
    const diffMinutes = (currentTime - sessionStart) / (1000 * 60);

    if (diffMinutes < 30) {
      return res.status(403).json({ error: 'La liste d\'émargement n\'est pas encore disponible. Veuillez attendre 30 minutes après le début du cours.' });
    }

    const maxDurationMinutes = 10 * 60;
    if (diffMinutes > maxDurationMinutes) {
      return res.status(403).json({ error: 'Le marquage de présence n\'est plus possible. Le délai de 10 heures est dépassé.' });
    }

    await pool.query('INSERT INTO attendance (session_id, student_id, status) VALUES (?, ?, ?)', [sessionId, studentId, status]);

    res.status(200).json({ message: 'Presence marked successfully.' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Error marking attendance.' });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
