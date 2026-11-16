import { Hono } from 'hono'
import { switchboardRoutes } from './routes/switchboardRoutes.js'

const app = new Hono()

app.get('/health', (c) =>
    c.json({ ok: true, service: '995-library-switchboard-worker' }, 200),
)
app.route('/api/switchboard', switchboardRoutes)

export default app
