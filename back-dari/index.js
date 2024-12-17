// Importation des modules nécessaires
const express = require("express");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const { db, collection, addDoc, query, where, getDocs } = require("./firebase"); // Importation de la configuration Firebase
const app = express();

// Middleware pour parser le corps des requêtes JSON
app.use(bodyParser.json());

let mqttSend = true;
let counter = 0;

// Connexion au broker MQTT
const mqttClient = mqtt.connect("mqtt://broker.hivemq.com"); // Remplacez par l'URL de votre broker MQTT
mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});
mqttClient.on("error", (err) => {
  console.error("MQTT connection error:", err);
});

// Route racine
app.get("/", (req, res) => res.send("Express server working"));

// Fonction pour sauvegarder les données CO2 dans Firestore
async function saveCO2Data(co2Value, userId) {
  try {
    const docRef = await addDoc(collection(db, "co2Data"), {
      co2Value,
      userId,
      timestamp: new Date().toISOString(),
    });
    console.log("Data saved to Firebase successfully:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("Error saving data to Firebase:", err);
    return { success: false, error: err };
  }
}

// Route pour sauvegarder les données depuis le frontend
app.post("/save-co2", async (req, res) => {
  const { co2Value, userId } = req.body;

  if (!co2Value || !userId) {
    return res
      .status(400)
      .send({ success: false, message: "Missing co2Value or userId" });
  }

  const response = await saveCO2Data(co2Value, userId);

  if (response.success) {
    res.status(200).send({ success: true, id: response.id });
  } else {
    res.status(500).send({ success: false, error: response.error });
  }
});

// Route pour récupérer les données CO2 pour un utilisateur spécifique
app.get("/get-co2/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({ success: false, message: "Missing userId" });
  }

  try {
    const q = query(collection(db, "co2Data"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return res
        .status(404)
        .send({ success: false, message: "No data found for this user" });
    }

    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send({ success: true, data });
  } catch (err) {
    console.error("Error fetching data from Firebase:", err);
    res.status(500).send({ success: false, error: err });
  }
});

// Générer une concentration de CO2 aléatoire
function generateRandomCO2() {
  const minCO2 = 0; // Minimum
  const maxCO2 = 10000; // Maximum
  const randomCO2 = Math.random() * (maxCO2 - minCO2) + minCO2;
  return parseFloat(randomCO2.toFixed(2));
}

// Sauvegarder uniquement lorsque le seuil est dépassé
const CO2_THRESHOLD = 1000; // Exemple de seuil

// Logique de publication MQTT
setInterval(async () => {
  let co2 = generateRandomCO2();
  if (mqttSend) {
    console.log(mqttSend, co2);
    mqttClient.publish("mayssa-58063153/co2", co2 + "", (err) => {
      if (err) {
        console.error("Error publishing MQTT message:", err);
      } else {
        console.log("MQTT message sent:", co2);
      }
    });
  }

 
}, 5000);

// Démarrer le serveur Express
app.listen(3000, () => {
  console.log("Server ready on port 3000.");
});

// Exporter l'application pour tests ou autres besoins
module.exports = app;
