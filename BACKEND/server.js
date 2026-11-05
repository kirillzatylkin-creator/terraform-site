import 'dotenv/config';
import app from './app.js';


if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`),
);
