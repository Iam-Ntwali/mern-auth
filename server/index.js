import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Nodemond! 🙂');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});