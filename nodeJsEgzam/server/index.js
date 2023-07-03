const express = require('express');
const mysql = require('mysql2');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { authenticate } = require('./middleware');
require('dotenv').config();

const server = express();
server.use(express.json());
server.use(cors());

const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASS,
  database: 'exam',
};

const userRegistSchema = Joi.object({
  full_name: Joi.string().trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
  repeatPassword: Joi.string().required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const dbPool = mysql.createPool(mysqlConfig).promise();

server.get('/', authenticate, (req, res) => {
  res.status(200).send({ message: 'Authorized' });
});

server.post('/register', async (req, res) => {
  let payload = req.body;

  try {
    payload = await userRegistSchema.validateAsync(payload);
  } catch (error) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    const encryptedPassword = await bcrypt.hash(payload.password, 10);
    const [response] = await dbPool.execute(
      `
      INSERT INTO users (full_name, email, password)
      VALUES (?, ?, ?)
      `,
      [payload.full_name, payload.email, encryptedPassword],
    );
    const token = jwt.sign(
      {
        full_name: payload.full_name,
        email: payload.email,
        id: response.insertId,
      },
      process.env.JWT_SECRET,
    );
    return res.status(201).json({ token });
  } catch (error) {
    return res.status(500).end();
  }
});

server.post('/login', async (req, res) => {
  let payload = req.body;

  try {
    payload = await userLoginSchema.validateAsync(payload);
  } catch (error) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    const [data] = await dbPool.execute(
      `
      SELECT * FROM users
      WHERE email = ?`,
      [payload.email],
    );

    if (!data.length) {
      return res.status(400).send({ error: 'Email or password did not match' });
    }

    const isPasswordMatching = await bcrypt.compare(
      payload.password,
      data[0].password,
    );

    if (isPasswordMatching) {
      const token = jwt.sign(
        {
          email: data[0].email,
          id: data[0].id,
        },
        process.env.JWT_SECRET,
      );
      return res.status(200).send({ token });
    }

    return res.status(400).send({ error: 'Email or password did not match' });
  } catch (error) {
    return res.status(500).end();
  }
});

server.post('/groups', async (req, res) => {
  const { name } = req.body;

  try {
    await dbPool.execute(
      `
      INSERT INTO groups (name)
      VALUES (?)`,
      [name],
    );
    return res.status(201).send({ message: 'Group add successfully' });
  } catch (error) {
    return res.status(500).end();
  }
});

server.get('/groups', async (req, res) => {
  try {
    const [groups] = await dbPool.execute('SELECT * FROM exam.groups');
    return res.json(groups);
  } catch (error) {
    return res.status(500).end();
  }
});

server.post('/accounts', authenticate, async (req, res) => {
  const { groupId } = req.body;
  const { userId } = req.user.id;

  try {
    await dbPool.execute(
      `
      INSERT INTO accounts (group_id, user_id)
      VALUES (?, ?)
      `,
      [groupId, userId],
    );
    return res.status(200);
  } catch (error) {
    return res.status(500).end();
  }
});

server.get('/accounts', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const [accounts] = await dbPool.execute(
      `
      SELECT g.id
      FROM groups AS g
      INNER JOIN accounts AS a ON g.id = a.group_id
      WHERE a.user_id = ?
      `,
      [userId],
    );
    return res.json(accounts);
  } catch (error) {
    return res.status(500).end();
  }
});

server.get('/bills/:group_id', authenticate, async (req, res) => {
  const { group_id: groupId } = req.params;
  try {
    const [bills] = await dbPool.execute(
      `
      SELECT *
      FROM bills
      WHERE group_id = ?
      `,
      [groupId],
    );
    return res.json(bills);
  } catch (error) {
    return res.status(500).end();
  }
});

server.post('/bills', authenticate, async (req, res) => {
  const { groupId, amount, description } = req.body;
  try {
    await dbPool.execute(
      `
      INSERT INTO bills (group_id, amount, description)
      VALUES (?, ?, ?)
      `,
      [groupId, parseFloat(amount, 10), description],
    );
    return res.status(201).send({ message: 'Bill created successfully' });
  } catch (error) {
    return res.status(500).end();
  }
});

server.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
