import express from "express";
import { conn, queryAsync } from "../dbconnect";
import { UserPostResponse } from "../mode/UserpostResponse";
import mysql from "mysql";

export const router = express.Router();

router.get("/users", (req,res)=>{
        const sql = "select * from users";
        conn.query(sql,(err,result)=>{
            res.json(result);
        })
    }
);

router.post("/user", (req, res) => {
    let user: UserPostResponse = req.body;
    let sql =
          "INSERT INTO `users`(`user_email`, `user_pass`, `user_gender`, `user_name`, `user_age`) VALUES (?,?,?,?,?)";
    sql = mysql.format(sql, [
        user.user_email,
        user.user_pass,
        user.user_gender,
        user.user_name,
        user.user_age,
        ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });