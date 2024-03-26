import express from "express";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import multer from "multer";
import { firebaseConfig } from "../config/firebase.config";
import mysql from "mysql";
import { conn } from "../dbconnect";
import { UserPostResponse } from "../mode/UserpostResponse";

export const router = express.Router();

initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/:id", upload.single("filename"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded!');
          }
        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);

        const metadata = {
            contentType: req.file.mimetype,
        };

        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const pictrueId = req.params.id;
        let sql = `INSERT INTO pictrue (pictrue_url, pictrue_p, u_id, pictrue_time) VALUES (?, ?, ?, ?)`;
        sql = mysql.format(sql, [downloadURL,1000,pictrueId, dateTime]); // เพิ่ม dateTime ลงใน query
        conn.query(sql, (err, result) => {
            if (err) throw err;
            res
              .status(201)
              .json({ affected_row: result.affectedRows, last_idx: result.insertId });
          });
        
        console.log('File successfully uploaded.');
    } catch (error) {
        return res.status(400).send(error)
    }
});



router.put("/update/:id", upload.single("filename"), async (req, res) => {
    
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded!');
        }

        const dateTime = giveCurrentDateTime();
        const fileName = `${req.file.originalname}_${dateTime}`;

        const storageRef = ref(storage, `files/${fileName}`);

        const metadata = {
            contentType: req.file.mimetype,
        };

        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const pictrueId = req.params.id;

        let sql = `UPDATE pictrue SET pictrue_url = ?, pictrue_p = ?, pictrue_time = ? WHERE pictrue_id = ?`;
        sql = mysql.format(sql, [downloadURL, 1000, dateTime, pictrueId]);

        conn.query(sql, (err, result) => {
            if (err) throw err;
            res.status(201).json({ affected_row: result.affectedRows, last_idx: result.insertId });
        });
        
        console.log('File successfully uploaded.');
    } catch (error) {
        return res.status(400).send(error)
    }
});


router.put("/userpictrue/:id", upload.single("filename"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded!');
          }
        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);

        const metadata = {
            contentType: req.file.mimetype,
        };

        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const userid = req.params.id;
        let sql = `UPDATE users SET user_pictrue = ? WHERE user_id = ?`;
        sql = mysql.format(sql, [downloadURL, userid]);
        conn.query(sql, (err, result) => {
            if (err) throw err;
            res
              .status(201)
              .json({ affected_row: result.affectedRows, last_idx: result.insertId });
          });
        
        console.log('File successfully uploaded.');
    } catch (error) {
        return res.status(400).send(error)
    }
});

router.put("/userprofile/:id", (req, res) => {
    let id = req.params.id;
    let user: UserPostResponse = req.body;
    let sql = `UPDATE users SET user_name = ?,user_age = ?,user_gender = ?,user_preference = ? WHERE user_id = ?`;
    sql = mysql.format(sql, [
      user.user_name,
      user.user_age,
      user.user_gender,
      user.user_preference,
      id,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}



export default router;