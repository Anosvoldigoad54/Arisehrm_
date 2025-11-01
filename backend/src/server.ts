import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import supabase from './config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface UserPayload {
  sub: string;
  email: string;
}

function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as UserPayload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('Health check error:', error);
      return res.json({ 
        ok: false, 
        error: error.message,
        supabase_configured: !!process.env.SUPABASE_URL 
      });
    }
    
    res.json({ 
      ok: true, 
      database: 'supabase',
      backend_port: process.env.PORT || 4000
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// AUTH
app.use('/api/auth', authRoutes);

// Users
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'select * from user_profiles where id = $1',
      [req.params.id]
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { email, full_name, department_id, position_id, role_id, team_id } = req.body;
    const { rows } = await pool.query(
      `insert into user_profiles (email, full_name, department_id, position_id, role_id, team_id)
       values ($1,$2,$3,$4,$5,$6)
       returning *`,
      [email, full_name, department_id, position_id, role_id, team_id]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const fields = ['email','full_name','department_id','position_id','role_id','team_id'];
    const updates: string[] = [];
    const values: any[] = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        values.push(req.body[f]);
        updates.push(`${f} = $${values.length}`);
      }
    });
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    const { rows } = await pool.query(
      `update user_profiles set ${updates.join(', ')} where id = $${values.length} returning *`,
      values
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Attendance
app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const { user_id, from, to } = req.query;
    const params: any[] = [];
    const where: string[] = [];
    if (user_id) { params.push(user_id); where.push(`user_id = $${params.length}`) }
    if (from) { params.push(from); where.push(`date >= $${params.length}`) }
    if (to) { params.push(to); where.push(`date <= $${params.length}`) }
    const sql = 'select * from attendance_records' + (where.length ? ' where ' + where.join(' and ') : '') + ' order by date desc limit 500';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/attendance', async (req: Request, res: Response) => {
  try {
    const { user_id, date, status, check_in, check_out, location } = req.body;
    const { rows } = await pool.query(
      `insert into attendance_records (user_id, date, status, check_in, check_out, location)
       values ($1,$2,$3,$4,$5,$6) returning *`,
      [user_id, date, status, check_in, check_out, location]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Attendance by id and updates
app.get('/api/attendance/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('select * from attendance_records where id = $1', [req.params.id]);
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/attendance/:id', async (req: Request, res: Response) => {
  try {
    const fields = [
      'status','clock_in','clock_out','break_start','break_end','total_hours','overtime_hours','is_approved','approved_by','approved_at','notes','location_in','location_out','ip_address_in','ip_address_out'
    ];
    const updates: string[] = [];
    const values: any[] = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        values.push(req.body[f]);
        updates.push(`${f} = $${values.length}`);
      }
    });
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    const { rows } = await pool.query(
      `update attendance_records set ${updates.join(', ')}, updated_at = now() where id = $${values.length} returning *`,
      values
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Leave requests
app.get('/api/leave-requests', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const params: any[] = [];
    const where: string[] = [];
    if (user_id) { params.push(user_id); where.push(`user_id = $${params.length}`) }
    const sql = 'select * from leave_requests' + (where.length ? ' where ' + where.join(' and ') : '') + ' order by created_at desc limit 500';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/leave-requests', async (req: Request, res: Response) => {
  try {
    const { user_id, leave_type_id, start_date, end_date, reason } = req.body;
    const { rows } = await pool.query(
      `insert into leave_requests (user_id, leave_type_id, start_date, end_date, reason)
       values ($1,$2,$3,$4,$5) returning *`,
      [user_id, leave_type_id, start_date, end_date, reason]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});
