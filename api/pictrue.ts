import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";

export const router = express.Router();

router.get("/all", (req, res) => {
  const sql = "SELECT * FROM pictrue ORDER BY RAND() LIMIT 2";
  conn.query(sql, (err, result) => {
    res.json(result);
  });
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const newScore = req.body.pictrue_p; 

  const sql = "UPDATE pictrue SET pictrue_p = ? WHERE pictrue_id = ?";

  conn.query(sql, [newScore, id], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // ส่งข้อมูลที่ได้กลับเป็น JSON response
      res.json(result);
    }
  });
});
