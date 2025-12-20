# Proceso de Desarrollo: Videollamadas con Santa Claus
## Documentación Técnico-Creativa del Experimento

---

## Cómo pensé el problema al inicio

Cuando empecé este proyecto a finales de noviembre de 2025, no estaba pensando en "crear un SaaS exitoso" ni en "disrumpir la industria navideña". Estaba pensando en algo mucho más específico: **¿Podría usar la tecnología de avatares de IA de HeyGen para crear un momento mágico entre un niño y Santa Claus?**

La pregunta no era técnica al principio. Era emocional.

Había visto cómo funcionaban los avatares de HeyGen en otros contextos corporativos y educativos. Avatares que podían hablar en tiempo real, responder a personas, generar conversaciones que se sentían naturales. Pensé: si esta tecnología puede hacer que alguien se sienta escuchado en una reunión de negocios, ¿por qué no podría hacer que un niño de 5 años crea que realmente está hablando con Santa?

No fue una idea de negocio primero. Fue curiosidad técnica mezclada con nostalgia navideña.

## Qué intentaba resolver realmente

El problema real no era "crear una videollamada con Santa". Ya existen servicios así. El problema que me interesaba era:

**¿Cómo haces que una experiencia mediada por IA se sienta genuinamente personal y mágica, no genérica y robótica?**

Porque eso es lo que mata la magia: cuando Santa dice cosas demasiado vagas, cuando la conversación se siente como un guion, cuando no hay conexión real con lo que el niño realmente quiere o le importa.

Quería resolver:
1. La personalización a escala (cada llamada única, sin intervención humana manual)
2. La naturalidad de la conversación (que no sonara a chatbot)
3. La brevedad controlada (que fuera accesible económicamente, pero suficiente para crear el momento)

Decidí conscientemente NO resolver:
- Escalabilidad masiva (no necesitaba millones de usuarios para validar si funcionaba)
- Grabación/entrega del video (quería que fuera efímero, como un momento real)
- Múltiples idiomas (solo español de México, para hacerlo bien)

## Qué restricciones me autoimpuse

Desde el día 1 establecí límites claros:

### Restricción económica: Los créditos de HeyGen
HeyGen cobra 2 créditos por minuto. Con $99 USD/mes obtienes 1000 créditos = 500 minutos totales. Esto significa que cada segundo de conversación cuesta dinero real.

Creé un documento completo (`TIME_CONTROL_SYSTEM.md`) no porque fuera obsesivo, sino porque entendí que **si un niño habla 1 minuto extra porque no controlé el tiempo, pierdo dinero**. El control de tiempo no era una "feature" — era la diferencia entre un proyecto viable y uno que me hacía perder $50 USD cada 10 llamadas.

Esto me forzó a pensar en:
- Planes de tiempo (5, 10, 20 minutos)
- Terminación automática forzada
- Sistema de triple seguridad (frontend timer, backend validation, webhook audit)

### Restricción de alcance: Solo lo esencial
Me resistí activamente a construir:
- Sistema de agendamiento (disponible 24/7, empieza inmediatamente)
- Panel de administración elaborado (inicialmente)
- Múltiples avatares (solo Santa)
- Modo de chat de texto (lo intenté, lo quité — commit `71a40c2`)

Decidí que si no podía validar la idea central con solo "niño → formulario → pago → videollamada", entonces agregar más cosas no lo arreglaría.

### Restricción geográfica/cultural: México primero
Pude haber hecho esto "internacional" desde el inicio. No lo hice. Lo centré en México porque:
- Stripe acepta MXN directamente
- Podía validar pricing en un solo mercado
- El español de Santa necesitaba sonar auténtico, no traducido
- Las referencias culturales importan ("Nochebuena" vs "Christmas Eve")

## Cómo tomé decisiones durante el desarrollo

### Decisión 1: Empezar complejo, simplificar después
Mi primer sistema de precios tenía 3 planes: Mini ($45 MXN), Premium ($80 MXN), VIP ($140 MXN).

¿Por qué 3? Porque había leído que ofrecer opciones aumenta conversiones. Porque pensé que algunos pagarían más por más tiempo.

Eventualmente lo simplifiqué a UN solo plan de $150 MXN por 5 minutos (commit `1eb14e7`).

¿Por qué? Porque con opciones estaba preguntando a los padres: "¿Cuánto vale la magia para ti?" Es una pregunta incómoda. Con un solo precio, la pregunta es más simple: "¿Quieres esto sí o no?"

Además, 5 minutos resultó ser el tiempo ideal. Suficiente para crear el momento, no tan largo que un niño de 4 años pierda atención.

### Decisión 2: El demo interactivo (y su muerte rápida)
El commit más emocionante fue `8bc0ec4`: "GAME CHANGER: Replace static image with LIVE interactive demo".

Estaba convencido de que si la gente podía PROBAR hablar con Santa directamente en la landing page, las conversiones explotarían.

Lo implementé. Funcionó técnicamente. Fue impresionante.

Y dos días después lo quité (commit `257ccad`).

¿Por qué? Porque descubrí algo incómodo: el demo confundía más de lo que ayudaba. La gente no entendía si era el producto real o solo un preview. Algunos pensaban que era gratis. Otros se frustraban cuando no podían "comprarlo" directamente desde ahí.

Volví a una imagen estática de Santa. Menos innovador, más claro.

### Decisión 3: Mobile-first como supervivencia, no como buzzword
El commit `96b0247` dice: "CRITICAL: Mobile optimization to fix 93% non-converting traffic".

Había lanzado la landing page. Tenía tráfico. CERO conversiones.

Revisé Google Analytics. 93% del tráfico era móvil. La landing estaba optimizada para desktop.

No fue una decisión de "queremos ser mobile-first porque es 2025". Fue: **"Si no arreglo esto ahora, el proyecto muere"**.

Pasé un día completo haciendo que cada botón, cada texto, cada imagen funcionara en una pantalla de 375px de ancho.

### Decisión 4: Los checkpoints conversacionales
Esta fue la decisión más reciente y surgió de feedback real de usuarios.

Los padres me decían: "La llamada estuvo bien, pero Santa no mencionó todo lo que puse en el formulario. Solo habló de los regalos, no preguntó sobre su escuela ni sus mascotas."

El problema: Santa es un LLM. Sin guía, divaga. Puede terminar hablando 3 minutos sobre renos y no tocar los temas que realmente importan.

Implementé un sistema de "checkpoints" (commits `a35d5d5`, `fc7f414`):
- A los 2 minutos: menciona comportamiento
- A los 3 minutos: habla de los deseos
- A los 3:45 minutos: toca temas adicionales (mascotas, hobbies)
- A los 35 segundos restantes: despedida explícita

No es perfecto. A veces se siente un poco mecánico. Pero asegura que los padres sientan que "Santa realmente sabía todo sobre mi hijo".

## Qué se resolvió rápido y por qué

### Lo técnico básico fue rápido
- Integración de HeyGen SDK: ~2 horas
- Stripe checkout: ~3 horas
- Meta Pixel tracking: ~1 hora
- Deploy en Vercel: ~30 minutos

¿Por qué rápido? Porque usé herramientas que ya conocía y documentación clara. No intenté ser creativo aquí. Solo "hacer que funcione".

### Lo que tomó tiempo fueron las decisiones humanas
- Decidir el tono de voz de Santa: días de iteración
- Escribir las instrucciones del contexto de HeyGen: reescrito 5+ veces
- El copy de la landing page: innumerables versiones
- El pricing: cambió 3 veces antes de establecerse

No porque fuera técnicamente difícil. Porque requería probar, obtener feedback, volver a pensar.

## Qué se probó y se descartó

### Chat mode (modo texto)
Implementé un botón de toggle para que los padres pudieran escribirle a Santa además de hablar.

Lo quité (commit `71a40c2`).

¿Por qué? Porque descubrí que los niños no querían escribir. Querían HABLAR. Los que sí escribían eran los padres tratando de "controlar" la conversación. Arruinaba la magia.

### Demo interactivo en landing
Ya mencionado arriba. Gran idea en teoría. Confuso en práctica.

### Múltiples versiones de landing page (A/B test)
Creé una Landing V2 con diseño diferente (commit `1738d73`).

Probé ambas. La original convertía mejor.

¿Por qué? No estoy seguro. Mi teoría: menos elementos visuales = más foco en el CTA.

## Cómo usé la IA como herramienta

### Claude Code fue mi par de programación
Todos los commits dicen "Generated with Claude Code" porque es cierto. Claude Code escribió probablemente el 70-80% del código que ves.

¿Significa que solo "le pedí que hiciera todo"? No.

Mi proceso era:
1. Yo definía QUÉ necesitaba y POR QUÉ
2. Claude Code proponía CÓMO implementarlo
3. Yo revisaba, probaba, pedía ajustes
4. Iterábamos

Ejemplo concreto del sistema de checkpoints:
- **Yo**: "Necesito que Santa mencione todos los temas del formulario de forma natural durante la llamada"
- **Claude Code**: "Podríamos usar eventos de LiveKit para enviar prompts en momentos específicos"
- **Yo**: "Muéstrame cómo se vería eso con código"
- **Claude Code**: [Implementa sistema de checkpoints]
- **Yo**: "Los prompts suenan muy robóticos, hazlos más fluidos"
- **Claude Code**: [Reescribe prompts con lenguaje más natural]
- **Yo**: "La despedida no es suficientemente explícita, agrega frases específicas"
- **Claude Code**: [Ajusta checkpoint final]

Claude Code aceleró la implementación técnica dramáticamente. Pero las decisiones de DISEÑO — qué construir, qué no, cómo debería sentirse — fueron 100% mías.

### Dónde la IA ayudó menos
- **Decisiones de negocio**: ¿Cuánto cobrar? ¿Un plan o tres? ¿Qué incluir en el formulario?
- **Copy marketing**: Claude puede generar copys, pero distinguir entre "suena bien" y "convierte" requiere intuición humana
- **Priorización**: ¿Qué construir ahora vs después? La IA no tiene urgencia ni recursos limitados

## Cómo fui validando el proyecto

### No construí todo antes de lanzar
Mi primer "lanzamiento" fue:
- Una landing page
- Formulario de info del niño
- Pago con Stripe
- Videollamada básica

NO tenía:
- Sistema de emails automatizados
- Dashboard de administración
- Analytics avanzado
- Soporte 24/7

¿Suficiente para probar? Sí. ¿Podría haber un usuario con mala experiencia? También sí.

Decidí que era más importante validar "¿La gente paga por esto?" que tener todo perfectamente pulido.

### Feedback directo fue más valioso que analytics
Los números (Google Analytics, Meta Pixel) me decían DÓNDE estaba el problema (93% móvil sin conversiones).

Pero hablar con 3-4 padres después de las llamadas me dijo QUÉ arreglar:
- "Santa se despidió muy abruptamente" → Sistema de despedida explícita
- "No mencionó todo lo que escribí" → Sistema de checkpoints
- "El botón decía Reservar pero quería hablar ahora" → Cambié CTA a "Hablar Ahora"

### Qué consideré "suficiente para probar"
Criterio simple: **¿Un padre puede pagar y su hijo puede tener una conversación de 5 minutos con Santa?**

Si la respuesta era sí, era suficiente para lanzar.

TODO lo demás (mejor UI, emails bonitos, social proof, testimonials) podía venir después.

## Qué decisiones fueron conscientemente temporales

### El cupón 100SANTA
Implementé un cupón de 100% descuento (commit `036d150`).

¿Por qué? Para poder regalar llamadas a amigos/familia para obtener feedback sin cobrarles.

Es temporal. Una vez validado, ese cupón desaparece.

### Sin base de datos inicialmente
Empecé sin Supabase, sin persistencia de datos. Todo efímero.

¿Por qué? Porque agregar una DB agrega:
- Complejidad técnica
- Decisiones de schema
- Preocupaciones de privacidad/GDPR

Decidí: "Si nadie paga, no necesito DB. Si pagan, entonces la agrego."

### Docs técnicos detallados pero sin implementar
Creé documentos como `TIME_CONTROL_SYSTEM.md` con especificaciones super detalladas de cosas que AÚN NO HE IMPLEMENTADO.

¿Por qué? Porque necesitaba:
1. Pensar el sistema completo antes de construirlo
2. Tener una referencia cuando sí fuera a implementarlo
3. No olvidar detalles críticos (como que cada minuto extra me cuesta dinero)

Pero no los implementé inmediatamente. Porque primero necesitaba validar que alguien pagaría $150 MXN por hablar con Santa.

## Qué revela este proceso sobre mi forma de crear

### Pienso en productos como experimentos, no como startups
No empecé con un pitch deck. Empecé con: "¿Funcionará esto?"

No proyecté revenue a 3 años. Proyecté: "¿Cuántas llamadas puedo hacer con 1000 créditos de HeyGen antes de que se acabe el presupuesto?"

Esta mentalidad de experimento me dio permiso para:
- Construir rápido sin overthinking
- Cambiar de idea sin sentir que "fallé"
- Aprender de cada iteración

### Equilibrio entre tecnología, emoción y pragmatismo

**Tecnología**: HeyGen es impresionante. Avatares realistas, conversaciones fluidas. Eso abre posibilidades.

**Emoción**: La magia de creer en Santa. El momento cuando un niño escucha su nombre. Eso es lo que vendo.

**Pragmatismo**: HeyGen cobra por minuto. Stripe cobra comisiones. El control de tiempo no es opcional. Las matemáticas importan.

Este proyecto existe en la intersección de los tres. Si ignoro cualquiera, se cae.

### Enfrento la incertidumbre construyendo incremental
No sabía si funcionaría. No sabía si alguien pagaría. No sabía si la experiencia sería lo suficientemente buena.

En lugar de analizar hasta tener certeza (que nunca llega), construí la versión más simple que pudiera probar la hipótesis central.

Luego otra. Y otra.

Cada commit es un paso de aprendizaje.

### Itero basado en señales reales, no en opiniones
Cambié el pricing porque vi números reales de conversión.
Optimicé para móvil porque vi 93% de tráfico móvil.
Agregué checkpoints porque usuarios reales me dijeron que faltaba.

No cambié cosas porque "sería buena idea" o "leí en un blog que funcionaba".

## Aprendizajes técnicos específicos

### HeyGen no es plug-and-play para casos de uso personalizados
La documentación asume casos de uso corporativos (atención al cliente, sales). Para un Santa conversacional necesité:
- Entender LiveKit profundamente (no solo HeyGen SDK)
- Experimentar con diferentes formatos de contexto
- Descubrir que los "command events" en topic 'agent-control' permiten guiar la conversación en tiempo real

Esto tomó días de prueba y error.

### Stripe es más que "agregar pagos"
Implementar Stripe Checkout: fácil.
Entender la diferencia entre Coupons y Promotion Codes: menos obvio.
Configurar webhooks correctamente para no perder pagos: crítico.

Aprendí que los detalles importan. Un webhook mal configurado = dinero cobrado pero servicio no entregado.

### Meta Pixel es sensible al placement
Tuve un bug donde el pixel no trackeaba conversiones. El problema: estaba en el lugar equivocado del HTML.

No fue la API. No fue el código. Fue literalmente dónde puse el `<script>`.

### TypeScript ayuda pero también frena
TypeScript me salvó de errores tontos innumerables veces.

También me hizo gastar 30 minutos arreglando un error de "Property 'room' is private" cuando estaba tratando de acceder a una propiedad interna de HeyGen SDK.

Solución: `as any`. No elegante, pero funcional.

## Lo que no sabía que necesitaría

### Control explícito de despedida
Asumí que Santa naturalmente se despediría cuando se acabara el tiempo.

Los niños no se despiden. Siguen hablando. Santa seguía respondiendo.

Necesité agregar un checkpoint específico a 35 segundos que le ORDENA a Santa: "DEBES decir 'me tengo que ir', 'adiós', 'nos vemos pronto'".

Funciona. Se siente un poco forzado a veces. Pero asegura que el niño entienda que la llamada está terminando.

### Fluidez conversacional vs. cobertura de temas
Inicialmente pensé: "El LLM manejará la conversación naturalmente."

Realidad: sin guía, Santa hablaba 4 minutos sobre renos y 30 segundos sobre lo que realmente importaba.

Los checkpoints resolvieron esto, pero crearon un nuevo problema: a veces las transiciones se sienten abruptas.

Iteré los prompts 3 veces para hacerlos más fluidos (commit `fc7f414`):
- De "Ahora pregunta sobre..." a "Si aún no lo has hecho, busca una transición natural para..."
- De comandos directos a sugerencias contextuales
- De "menciona" a "incorpora naturalmente"

Todavía no es perfecto. Pero es mejor.

### CTAs importan más de lo que pensé
Cambié "Reservar Ahora" a "Hablar Ahora" (commit `319bf02`).

¿Impacto medible en conversiones? No lo sé aún, muy reciente.

¿Pero es más honesto? Sí. No estás reservando una cita. Estás hablando AHORA. El lenguaje importa.

## Estado actual y próximos pasos

### Dónde está el proyecto hoy (19 dic 2025)
- ✅ Landing page funcional (móvil-optimizada)
- ✅ Stripe checkout con plan único de $150 MXN
- ✅ Videollamadas de 5 minutos con Santa
- ✅ Sistema de checkpoints conversacionales
- ✅ Meta Pixel para tracking
- ✅ Cupón 100SANTA para testing
- ⏳ Sin base de datos persistente
- ⏳ Sin sistema de emails automatizados
- ⏳ Sin generación de carta personalizada post-llamada

### Por qué no he implementado lo que falta
No es por flojera. Es porque estoy esperando señales.

Si veo que:
- 50+ personas pagan
- Las conversiones se mantienen arriba de 3%
- La gente pide features específicos (como recibir transcripción o video grabado)

ENTONCES construiré:
- Supabase para persistencia
- Sistema de emails con Zapier
- Dashboard de administración
- Analytics más profundos

Pero si nadie paga, construir eso sería esfuerzo desperdiciado.

### Qué cambiaría si empezara de nuevo

**Empezaría con móvil desde día 1**. No como segundo pensamiento.

**Hablaría con potenciales usuarios ANTES de escribir código**. Aunque solo fueran 5 conversaciones de 10 minutos.

**Documentaría decisiones mientras las tomo, no después**. Es más fácil recordar el POR QUÉ en el momento que reconstruirlo semanas después.

**Mantendría la simplicidad por más tiempo**. Cada feature agrega complejidad. El costo de mantener features es mayor que el costo de agregarlas.

### Qué NO cambiaría

**Usar Claude Code intensivamente**. Me permitió construir en días lo que me hubiera tomado semanas.

**Empezar sin DB**. Fue la decisión correcta. Agregó complejidad solo cuando fue necesaria.

**Lanzar imperfecto**. Si hubiera esperado a que todo estuviera "listo", seguiría esperando.

**Iterar basado en feedback real, no imaginado**. Cada cambio significativo vino de usuarios reales, no de especulación.

## Reflexión final: Wave X Labs como metodología

Este proyecto ejemplifica lo que creo que Wave X Labs representa:

**Usar tecnología de punta (HeyGen, IA conversacional) no para hacer algo "cool" sino para resolver un problema humano específico (crear un momento mágico para un niño).**

**Moverse rápido, pero con intención**. Construir en días, no meses. Pero cada decisión tiene un porqué.

**Aceptar la impermanencia**. Esto es un experimento de temporada navideña 2025. No necesita durar para siempre para valer la pena.

**Documentar el proceso, no solo el resultado**. Este documento existe porque el aprendizaje está en CÓMO se construyó, no solo en QUÉ se construyó.

El valor no está en si vendí 100 o 1000 llamadas con Santa.

El valor está en:
- Aprender a integrar HeyGen para casos de uso no documentados
- Entender cómo equilibrar personalización IA con control de costos
- Descubrir qué hace que una experiencia digital se sienta "mágica" vs "robótica"
- Practicar el arte de construir rápido sin construir basura

Eso se queda conmigo para el próximo experimento.

---

**Documento creado**: 19 de diciembre de 2025
**Proyecto**: Videollamadas con Santa Claus - Wave X Labs
**Tecnologías principales**: React, TypeScript, HeyGen LiveAvatar, Stripe, Vercel
**Estado**: Experimento activo, en producción, iterando basado en feedback real
**Líneas de código escritas**: ~3,500 (70% asistido por Claude Code)
**Commits**: 45+
**Días de desarrollo activo**: ~15
**Usuarios que han probado**: [Pendiente de actualizar con datos reales]
