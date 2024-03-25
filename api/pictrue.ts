import express from "express";
import { conn, queryAsync } from "../dbconnect";
import { PictruepostResponse } from "../mode/PictruepostResponse";
import mysql from "mysql";
export const router = express.Router();

router.get("/all/:p_id", (req, res) => {
  const sql = `
    SELECT 
        (pictrue_p - COALESCE(SUM(CASE WHEN v.vote_timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN v.vote_point ELSE 0 END), 0)) AS initial_score 
    FROM pictrue p 
    LEFT JOIN vote v ON p.pictrue_id = v.pt_id 
    WHERE p.pictrue_id = ? 
    GROUP BY p.pictrue_id
  `;
  conn.query(sql, [req.params.p_id], (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (typeof result[0].initial_score === "string") {
      result[0].initial_score = parseFloat(result[0].initial_score);
    }

    res.json(result);
  });
});

router.get("/alls", (req, res) => {
  const sql = `
WITH RankedPictrue AS (
    SELECT 
        pictrue_id,
        pictrue_url,
        u_id,
        pictrue_p,
        ROW_NUMBER() OVER (ORDER BY pictrue_p DESC) AS ranking
    FROM pictrue
)
SELECT
    r1.pictrue_id,
    r1.pictrue_url,
    r1.u_id,
    COALESCE(r2.ranking, 0) - r1.ranking  AS rank_difference,
    r1.pictrue_p
FROM RankedPictrue r1
LEFT JOIN (
    SELECT 
        pictrue_id,
        ROW_NUMBER() OVER (ORDER BY total_point DESC) AS ranking
    FROM (
        SELECT 
            p.pictrue_id, 
            p.pictrue_p, 
            CASE 
                WHEN SUM(v.vote_point) IS NULL THEN p.pictrue_p 
                ELSE p.pictrue_p + COALESCE(SUM(v.vote_point), 0) 
            END AS total_point
        FROM pictrue p
        LEFT JOIN vote v ON p.pictrue_id = v.pt_id AND DATE(v.vote_timestamp) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        GROUP BY p.pictrue_id, p.pictrue_p
    ) AS subquery
) AS r2 ON r1.pictrue_id = r2.pictrue_id
ORDER BY r1.pictrue_p DESC;



  

`;
  // const sql = `SELECT *, ROW_NUMBER() OVER (ORDER BY pictrue_p DESC) AS ranking  FROM pictrue ORDER BY pictrue_p DESC`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(result);
  });
});

// สร้างตัวแปรเพื่อเก็บรูปที่ถูกสุ่มไว้
let selectedPictures: any[] = [];
let time: number ;
router.get("/duo/:id", (req, res) => {
  // ตรวจสอบว่ามี user_id ที่ส่งมาหรือไม่
  const userId = req.params.id;
  if (!userId) {
    res.status(400).json({ error: "Missing user_id parameter" });
    return;
  }

  // ตรวจสอบว่า selectedPictures ยังไม่มีข้อมูลหรือเปล่า
  if (selectedPictures.length === 0) {
    // ถ้ายังไม่มีให้ทำการสุ่มรูปภาพ
    const sql = "SELECT * FROM pictrue ORDER BY RAND() LIMIT 2";
    const sql1 = "SELECT time FROM systemtime";
    conn.query(sql1, (err, timeResult) => {
      if (err) {
        console.error("Error executing time query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      // เมื่อได้ค่า time จากการ query ให้นำไปใช้ได้ตามต้องการที่นี่
     time = timeResult[0].time;

      // ต่อไปคุณสามารถใช้ค่า time ในการตอบกลับหรือนำไปใช้ในการ query อื่น ๆ ได้
    });
    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      // วนลูปผลลัพธ์ที่ได้จากการ query
      result.forEach((pic: { pictrue_id: any }) => {
        // เพิ่ม pictrue_id ลงใน selectedPictures array
        selectedPictures.push({ pictrue_id: pic.pictrue_id, user_id: userId });
        // เริ่มต้นการนับเวลา 10 วินาทีและลบ pictrue_id ออกจาก selectedPictures
        setTimeout(() => {
          const index = selectedPictures.findIndex(
            (item) =>
              item.pictrue_id === pic.pictrue_id && item.user_id === userId
          );
          if (index !== -1) {
            selectedPictures.splice(index, 1);
            console.log(
              `Removed pictrue_id ${pic.pictrue_id} from selectedPictures for user ${userId}`
            );
          }
        }, time*1000); // 10 วินาที
      });
      // ส่งผลลัพธ์กลับไป
      res.json(result);
    });
  } else {
    // ถ้ามีรูปที่ถูกสุ่มแล้วอยู่ใน selectedPictures
    // ให้ทำการสุ่มใหม่ และตรวจสอบว่า pictrue_id นั้นอยู่ใน selectedPictures หรือไม่
    let sql =
      "SELECT * FROM pictrue WHERE pictrue_id NOT IN (?) ORDER BY RAND() LIMIT 2";
    conn.query(
      sql,
      [selectedPictures.map((item) => item.pictrue_id)],
      (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        // วนลูปผลลัพธ์ที่ได้จากการ query
        result.forEach((pic: { pictrue_id: any }) => {
          // เพิ่ม pictrue_id ลงใน selectedPictures array
          selectedPictures.push({
            pictrue_id: pic.pictrue_id,
            user_id: userId,
          });
          // เริ่มต้นการนับเวลา 10 วินาทีและลบ pictrue_id ออกจาก selectedPictures
          setTimeout(() => {
            const index = selectedPictures.findIndex(
              (item) =>
                item.pictrue_id === pic.pictrue_id && item.user_id === userId
            );
            if (index !== -1) {
              selectedPictures.splice(index, 1);
              console.log(
                `Removed pictrue_id ${pic.pictrue_id} from selectedPictures for user ${userId}`
              );
            }
          }, time*1000); // 30 วินาที
        });
        // ส่งผลลัพธ์กลับไป
        res.json(result);
      }
    );
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const newScore = req.body.pictrue_p;

  const sql = "UPDATE pictrue SET pictrue_p = ? WHERE pictrue_id = ?";

  conn.query(sql, [newScore, id], (err, result) => {
    if (err) {
      console.error("Error executing SQL:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(200).json({
      message: "Successfully updated record",
      affected_row: result.affectedRows,
    });
  });
});

router.get("/statistics/:pictrue_id", (req, res) => {
  try {
    const pictrueId = req.params.pictrue_id;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sql = `
      SELECT COUNT(*) as count, DATE(vote_timestamp) as date, SUM(vote_point) as total_score
      FROM vote
      WHERE pt_id = ? AND vote_timestamp BETWEEN ? AND ?
      GROUP BY DATE(vote_timestamp)
      ORDER BY DATE(vote_timestamp) ASC
      
    `;

    conn.query(sql, [pictrueId, startDate, endDate], (err, results) => {
      if (err) {
        console.error("Error executing SQL:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      const statistics = results.map((row: any) => ({
        date: row.date,
        count: row.count,
        total_score: row.total_score,
      }));

      res.status(200).json(statistics);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add", (req, res) => {
  let pictrue: PictruepostResponse = req.body;
  let sql =
    "INSERT INTO `pictrue`(`pictrue_url`,`pictrue_p`,`u_id`) VALUES (?,?,?)";
  sql = mysql.format(sql, [
    pictrue.pictrue_url,
    pictrue.pictrue_p,
    pictrue.u_id,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

router.delete("/delete/:id", (req, res) => {
  let id = +req.params.id;

  conn.query(
    `DELETE pictrue, vote
    FROM pictrue
    LEFT JOIN vote ON pictrue.pictrue_id = vote.pt_id
    WHERE pictrue.pictrue_id = ?`,
    [id],
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ affected_row: result.affectedRows });
    }
  );
});
