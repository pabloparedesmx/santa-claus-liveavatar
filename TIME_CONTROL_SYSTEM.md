# Sistema de Control de Tiempo - Santa Claus Live Avatar

## 📊 Análisis de Costos

### HeyGen Pricing
- **2 créditos/minuto**
- **$99 USD = 1000 créditos/mes = 500 minutos totales**

### Nuestros Planes y Márgenes

| Plan | Precio | Tiempo | Créditos HeyGen | Costo HeyGen | Margen Bruto | % Margen |
|------|--------|---------|-----------------|--------------|--------------|----------|
| Mini Carta | $45 MXN (~$2.50 USD) | 5 min | 10 créditos | $0.99 USD | $1.51 USD | **60%** |
| Carta Premium | $80 MXN (~$4.44 USD) | 10 min | 20 créditos | $1.98 USD | $2.46 USD | **55%** |
| Experiencia VIP | $140 MXN (~$7.78 USD) | 20 min | 40 créditos | $3.96 USD | $3.82 USD | **49%** |

### Capacidad Mensual (con 1000 créditos)
- **100 llamadas Mini** = 500 minutos
- **50 llamadas Premium** = 500 minutos
- **25 llamadas VIP** = 500 minutos
- **O cualquier combinación que sume 1000 créditos**

---

## 🚨 Por Qué es CRÍTICO Controlar el Tiempo

Si un usuario habla **1 minuto extra**, perdemos dinero. El control de tiempo no es una "feature" - **es esencial para la viabilidad del negocio**.

---

## 🛡️ Sistema de Triple Seguridad (A Implementar)

### Nivel 1: Frontend Timer (AvatarChat.tsx)

```typescript
const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);
const [gracePeriodActive, setGracePeriodActive] = useState(false);

useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      // Advertencia a 2 minutos
      if (prev === 120) {
        showWarning('⏰ Quedan 2 minutos con Santa');
      }

      // Advertencia FINAL a 30 segundos
      if (prev === 30) {
        showWarning('⚠️ ¡Solo 30 segundos! Santa se despedirá pronto');
        // Enviar señal a Santa para despedirse
        session.voiceChat.interrupt({
          text: "Santa, es hora de despedirse porque el tiempo casi termina."
        });
      }

      // TERMINACIÓN FORZADA a 0 segundos
      if (prev <= 0) {
        handleForceEndCall('time_limit');
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [connectionStatus]);
```

**Características:**
- ✅ Timer visual siempre visible
- ✅ Advertencias progresivas (2 min, 30 seg)
- ✅ Despedida natural de Santa
- ✅ Corte automático a los 0 segundos

---

### Nivel 2: Backend Validation (server.js)

```javascript
// Middleware para validar tiempo en cada request a HeyGen
app.use('/api/heygen/*', async (req, res, next) => {
  const { session_id } = req.body;

  const session = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .single();

  // Calcular tiempo transcurrido REAL
  const elapsed = (Date.now() - new Date(session.started_at)) / 1000;
  const limit = session.time_limit_minutes * 60;

  // Hard limit: No permitir requests si ya expiró
  // Solo 15 segundos de gracia para despedida natural
  if (elapsed > limit + 15) {
    return res.status(403).json({
      error: 'Session time expired',
      message: 'Tu tiempo con Santa ha terminado'
    });
  }

  next();
});
```

**Por qué es importante:**
- 🔒 Previene manipulación desde el cliente
- 🔒 Validación basada en timestamp del servidor
- 🔒 Hard limit infranqueable

---

### Nivel 3: Auditoría con Webhook de HeyGen

```javascript
// Registrar uso REAL de minutos según HeyGen
app.post('/api/heygen-webhook', async (req, res) => {
  const { session_id, duration_seconds } = req.body;

  // Guardar duración real reportada por HeyGen
  await supabase
    .from('sessions')
    .update({
      actual_duration_seconds: duration_seconds,
      credits_used: Math.ceil(duration_seconds / 60) * 2,
      ended_at: new Date()
    })
    .eq('heygen_session_id', session_id);

  // Actualizar contador de créditos
  await updateMonthlyCreditsUsage(Math.ceil(duration_seconds / 60) * 2);

  res.json({ ok: true });
});
```

---

## 📊 Dashboard de Créditos (ESENCIAL)

```javascript
// Endpoint para monitorear uso de créditos
app.get('/api/credits/usage', async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sessions = await supabase
    .from('sessions')
    .select('credits_used, plan_type')
    .gte('started_at', startOfMonth.toISOString())
    .eq('status', 'completed');

  const totalUsed = sessions.reduce((sum, s) => sum + (s.credits_used || 0), 0);
  const remaining = 1000 - totalUsed;
  const percentUsed = (totalUsed / 1000) * 100;

  res.json({
    month: startOfMonth.toISOString().slice(0, 7),
    total_credits: 1000,
    used: totalUsed,
    remaining,
    percent_used: percentUsed.toFixed(2),
    estimated_calls_remaining: {
      mini: Math.floor(remaining / 10),
      premium: Math.floor(remaining / 20),
      vip: Math.floor(remaining / 40)
    },
    sessions_completed: sessions.length
  });
});

// ALERTAS AUTOMÁTICAS
if (percentUsed >= 80) {
  await sendAdminAlert('⚠️ Ya usaste el 80% de tus créditos HeyGen este mes!');
}

// PAUSAR VENTAS automáticamente al 95%
if (percentUsed >= 95) {
  await disableStripePayments();
  await sendAdminAlert('🚨 CRÉDITOS CASI AGOTADOS - Pagos pausados automáticamente');
}
```

**Funcionalidades:**
- 📊 Ver uso de créditos en tiempo real
- 📊 Proyectar llamadas restantes por tipo
- 📊 Alertas al 80% y 95% de uso
- 📊 Pausar ventas automáticamente si se acaban

---

## 🎨 UI - Timer Siempre Visible

```typescript
// AvatarChat.tsx - Timer prominente en el centro superior
<div className="absolute top-4 left-1/2 transform -translate-x-1/2
                bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full
                border-2 border-white/20">
  <div className="flex items-center gap-3">
    <Clock className={`w-5 h-5 ${timeRemaining <= 60 ? 'text-red-400 animate-pulse' : ''}`} />
    <span className={`font-mono text-xl font-bold ${
      timeRemaining <= 60 ? 'text-red-400' : 'text-white'
    }`}>
      {formatTimeRemaining(timeRemaining)}
    </span>
  </div>

  {timeRemaining <= 60 && (
    <div className="text-yellow-300 text-sm animate-pulse mt-1 text-center">
      ⚠️ Tiempo por terminar
    </div>
  )}
</div>
```

---

## 🗄️ Estructura de Base de Datos (Supabase)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Stripe
  payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_checkout_session_id TEXT,
  amount_paid_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'mxn',

  -- Plan
  plan_type TEXT NOT NULL CHECK (plan_type IN ('mini', 'premium', 'vip')),
  time_limit_minutes INTEGER NOT NULL,

  -- Child Info
  child_name TEXT NOT NULL,
  child_age INTEGER,
  child_location TEXT,
  wish_list TEXT,
  behavior_notes TEXT,

  -- Session Timing
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'cancelled')),

  -- HeyGen
  heygen_session_id TEXT,
  actual_duration_seconds INTEGER,
  credits_used INTEGER,

  -- Transcript & Letter
  transcript TEXT,
  letter_generated BOOLEAN DEFAULT FALSE,
  letter_sent_at TIMESTAMP,

  -- Indexes
  INDEX idx_payment_intent (payment_intent_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Tabla para tracking de créditos mensuales
CREATE TABLE monthly_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month DATE NOT NULL UNIQUE, -- Primer día del mes
  total_credits INTEGER DEFAULT 1000,
  used_credits INTEGER DEFAULT 0,
  remaining_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  sessions_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Flujo Completo de Implementación

### 1. Usuario Selecciona Plan
```
Landing Page → Click en plan → Stripe Checkout
```

### 2. Webhook de Stripe (Después del Pago)
```javascript
app.post('/webhook/stripe', async (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Crear registro en Supabase
    const { data: newSession } = await supabase
      .from('sessions')
      .insert({
        payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
        amount_paid_cents: session.amount_total,
        plan_type: session.metadata.plan_type,
        time_limit_minutes: session.metadata.time_limit,
        child_name: session.metadata.child_name,
        child_age: session.metadata.child_age,
        child_location: session.metadata.child_location,
        wish_list: session.metadata.wish_list,
        behavior_notes: session.metadata.behavior_notes,
        status: 'pending'
      })
      .select()
      .single();

    // Reservar créditos
    await reserveCredits(session.metadata.credits_needed);
  }
});
```

### 3. Redirigir a Videollamada
```
Success URL: /chat?session_id={SESSION_ID}
```

### 4. Iniciar HeyGen Session
```javascript
app.post('/api/start-call', async (req, res) => {
  const { session_id } = req.body;

  // Validar sesión
  const session = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .single();

  if (session.status !== 'pending') {
    return res.status(400).json({ error: 'Session already used or expired' });
  }

  // Verificar que hay créditos disponibles
  const creditsAvailable = await checkCreditsAvailable();
  if (!creditsAvailable) {
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }

  // Marcar como activa
  await supabase
    .from('sessions')
    .update({
      status: 'active',
      started_at: new Date()
    })
    .eq('id', session_id);

  // Crear HeyGen session token
  const heygenSession = await createHeyGenSession({ ... });

  res.json({
    session_token: heygenSession.session_token,
    time_limit_seconds: session.time_limit_minutes * 60,
    plan_type: session.plan_type
  });
});
```

### 5. Durante la Llamada
- Frontend muestra timer countdown
- Backend monitorea tiempo transcurrido
- A los 0 segundos: terminación automática

### 6. Al Terminar la Llamada
```javascript
app.post('/api/end-call', async (req, res) => {
  const { session_id, transcript } = req.body;

  const session = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .single();

  const actualDuration = (Date.now() - new Date(session.started_at)) / 1000;
  const creditsUsed = Math.ceil(actualDuration / 60) * 2;

  // Actualizar sesión
  await supabase
    .from('sessions')
    .update({
      status: 'completed',
      ended_at: new Date(),
      actual_duration_seconds: Math.floor(actualDuration),
      credits_used: creditsUsed,
      transcript
    })
    .eq('id', session_id);

  // Actualizar contador mensual
  await updateMonthlyCredits(creditsUsed);

  // Trigger Zapier webhook para generar carta
  await triggerLetterGeneration(session_id);

  res.json({ ok: true });
});
```

---

## 🚀 Sistema de Reserva de Créditos

```javascript
// Antes de aceptar pago, verificar disponibilidad
app.post('/api/checkout/validate', async (req, res) => {
  const { plan } = req.body;

  const creditsNeeded = {
    mini: 10,
    premium: 20,
    vip: 40
  }[plan];

  const { remaining_credits } = await getCurrentMonthCredits();

  // No permitir venta si no hay suficientes créditos
  if (remaining_credits < creditsNeeded) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Lo sentimos, no hay disponibilidad en este momento. Intenta mañana.'
    });
  }

  res.json({ ok: true, credits_available: remaining_credits });
});
```

---

## 📈 Analytics y Reportes

### Métricas Importantes
- ✅ Créditos usados vs límite mensual
- ✅ Promedio de duración real vs tiempo límite
- ✅ Sesiones que excedieron el tiempo
- ✅ Ingresos totales vs costo de HeyGen
- ✅ Margen de ganancia real
- ✅ Proyección de agotamiento de créditos

### Dashboard Admin (Futuro)
```
/admin/dashboard
- Gráfica de uso de créditos diario/mensual
- Lista de sesiones activas
- Alertas de créditos bajos
- Revenue vs Costos
- Capacidad restante
```

---

## ⚠️ Plan de Contingencia

### Si se Acaban los Créditos a Mitad de Mes

**Opción A: Comprar Más Créditos**
- Si el negocio va bien, comprar otro plan de HeyGen
- Evaluar upgrade a plan enterprise

**Opción B: Pausar Ventas**
- Desactivar Stripe automáticamente
- Mostrar mensaje: "Disponible nuevamente el 1 de [mes]"
- Ofrecer lista de espera con descuento

**Opción C: Ofrecer Solo Carta**
- $20 MXN - Carta personalizada sin videollamada
- Generada por IA basada en la información del formulario
- Márgenes del 100% (sin costo HeyGen)

---

## 📝 Notas de Implementación

### Prioridades
1. ✅ **AHORA**: Integrar Stripe + Supabase
2. ⏳ **Después del pago**: Implementar control de tiempo
3. ⏳ **Cuando funcione**: Dashboard de créditos
4. ⏳ **Optimización**: Analytics y alertas

### Testing Crítico
- [ ] Verificar que timer se detiene exactamente a 0 segundos
- [ ] Probar reconexión - ¿sigue contando el tiempo?
- [ ] Probar refresh de página - ¿mantiene el tiempo correcto?
- [ ] Validar que backend rechaza requests después del límite
- [ ] Confirmar que HeyGen session se termina correctamente

### Consideraciones Especiales
- **Latencia de red**: Considerar 1-2 segundos de delay en comandos
- **Zona horaria**: Usar UTC para todos los timestamps
- **Redondeo de créditos**: HeyGen cobra por minuto completo (10.1 min = 11 min)
- **Grace period**: 15 segundos máximo para despedida natural

---

## 🔗 Referencias

- [HeyGen API Docs](https://docs.heygen.com)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)

---

**Última actualización**: 2025-01-08
**Estado**: 📋 Documentado - Pendiente de implementación
**Prioridad**: 🔴 CRÍTICA para viabilidad del negocio
