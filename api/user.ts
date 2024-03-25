import express from "express";
import { conn, queryAsync } from "../dbconnect";
import { UserPostResponse } from "../mode/UserpostResponse";
import mysql from "mysql";

export const router = express.Router();

router.get("/users", (req, res) => {
  const sql = "select * from users";
  conn.query(sql, (err, result) => {
    res.json(result);
  });
});
router.get("/userPro", (req, res) => {
  const sql = "select * from users where user_type = 2";
  conn.query(sql, (err, result) => {
    res.json(result);
  });
});
router.get("/:id", (req, res) => {
  let id = req.params.id;
  let sql = "SELECT * FROM users where user_id = ?";
  sql = mysql.format(sql, [id]);

  conn.query(sql, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let userObject = result[0];
      res.status(201).json(userObject);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

router.post("/user", (req, res) => {
  let url = "https://i.pinimg.com/564x/b6/e6/87/b6e687094f11e465e7d710a6b5754a4e.jpg";
  let user: UserPostResponse = req.body;
  let sql =
    "INSERT INTO `users`(`user_pictrue`,`user_email`, `user_pass`, `user_gender`, `user_name`, `user_age`) VALUES (?,?,?,?,?,?)";
  sql = mysql.format(sql, [
    url,
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
router.put("/user/:id", (req, res) => {
  let id = req.params.id;
  let user: UserPostResponse = req.body;
  let sql = `UPDATE users SET user_pass = ? ,user_pictrue = ?, user_name = ?,user_age = ?,user_gender = ?,user_preference = ? WHERE user_id = ?`;
  sql = mysql.format(sql, [
    user.user_pass,
    user.user_pictrue,
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
router.put("/userpass/:id", (req, res) => {
  let id = req.params.id;
  let user: UserPostResponse = req.body;
  let sql = `UPDATE users SET user_pass = ? WHERE user_id = ?`;
  sql = mysql.format(sql, [
    user.user_pass,
    id,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});
