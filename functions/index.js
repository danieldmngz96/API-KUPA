/* eslint-disable arrow-parens */
/* eslint-disable spaced-comment */
/* eslint-disable max-len */
/* eslint-disable space-before-blocks */
/* eslint-disable keyword-spacing */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const express = require("express");
const cors = require("cors");

const app = express();


admin.initializeApp({
    credential: admin.credential.cert('./permissions.json'),
});

const db = admin.firestore();

app.use(cors({ origin: true }));

app.post('/api/products', async (req, res) => {
    try {
        await db.collection('products')
            .doc('/' + req.body.id + '/')
            .create({ name: req.body });
        return res.status(204).json();
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

app.post('/api/createUser', async (req, res) => {
    try {
        const userData = {
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            phone: req.body.phone,
            // eslint-disable-next-line comma-dangle
            rol: req.body.rol
        };

        await db.collection('users').doc(req.body.id).set(userData);

        return res.status(200).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error al crear usuario' });
    }
});
//metodo get clase por ID
app.get('/clases/:id_clase', async (req, res) => {
    try {
        // Consultar la colección de clases
        const clasesCollection = admin.firestore().collection('clases');
        const querySnapshot = await clasesCollection.where('id_clase', '==', parseInt(req.params.id_clase)).get();

        if (querySnapshot.empty) {
            return res.status(404).json({ error: 'Clase no encontrada.' });
        }

        // Obtener los datos de la clase
        const claseData = querySnapshot.docs[0].data();
        res.status(200).json(claseData); // Devolver los datos de la clase como respuesta
    } catch (error) {
        console.error('Error al obtener la clase:', error);
        res.status(500).json({ error: 'Error al obtener la clase' });
    }
});

// eslint-disable-next-line spaced-comment
//POST para crear clases
app.post('/api/createClass', async (req, res) => {
    try {
        const classData = {
            description: req.body.description,
            fecha_publicacion: req.body.fecha_publicacion,
            id_teacher: req.body.id_teacher,
            imagen: req.body.imagen,
            teacher_name: req.body.teacher_name,
            // eslint-disable-next-line comma-dangle
            titulo: req.body.titulo,
            id_clases: req.body.id_clases,
        };

        await db.collection('clases').doc().set(classData); // Utilizamos doc() sin argumento para que Firestore genere un ID único automáticamente

        return res.status(200).json({ message: 'Clase creada exitosamente' });
    } catch (error) {
        console.error('Error al crear clase:', error);
        return res.status(500).json({ error: 'Error al crear clase' });
    }
});
app.get('/clases', async (req, res) => {
    try {
        const snapshot = await db.collection('clases').get(); // Obtener todos los documentos de la colección 'clases'
        const clases = []; // Array para almacenar los datos de las clases

        snapshot.forEach(doc => {
            // Para cada documento en la colección, obtenemos sus datos y los agregamos al array
            const data = doc.data();
            clases.push(data);
        });

        res.status(200).json(clases); // Devolvemos el array de clases como respuesta
    } catch (error) {
        console.error('Error al obtener las clases:', error);
        res.status(500).json({ error: 'Error al obtener las clases' });
    }
});
// Ruta POST para el inicio de sesión
app.post('/login', async (req, res) => {
    // eslint-disable-next-line spaced-comment
    try {
        const { email, password } = req.body;

        // Validar la entrada
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo electrónico o contraseña no válidos.' });
        }
        // Consultar la colección de usuarios
        const usersCollection = admin.firestore().collection('users');
        const querySnapshot = await usersCollection.where('email', '==', email).get();

        // eslint-disable-next-line spaced-comment
        //console.log(querySnapshot);
        // Manejar el caso de usuario no encontrado
        if (querySnapshot.empty) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        // Obtener el usuario
        const userDoc = querySnapshot.docs[0];

        // Validar la contraseña
        // eslint-disable-next-line spaced-comment
        if (password != userDoc.data().password) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        // Generar un token de sesión
        const token = await admin.auth().createCustomToken(userDoc.id);

        // Devolver el token al cliente
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});
/* app.get("/hello-world", (req, res) => {
  return res.status(200).json({message: "Hello World!"});
}); */

app.get('/api/products:product_id', async (req, res) => {
    try {
        await db.collection('products').doc(req.params.id);
        // eslint-disable-next-line no-undef
        const item = await doc.get();
        const response = item.data();
    } catch (e) {
        console.log(e);
    }
});


// Routes
app.use(require("./routes/products.routes"));

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
